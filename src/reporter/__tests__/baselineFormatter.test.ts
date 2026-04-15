import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { buildBaseline, applyBaseline, formatBaseline } from "../baselineFormatter";
import { parseBaseline, loadBaseline, saveBaseline } from "../baselineLoader";
import { Report, Issue } from "../types";

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    variable: "API_KEY",
    type: "missing",
    severity: "error",
    message: "API_KEY is missing from .env",
    locations: [{ file: "src/index.ts", line: 10 }],
    ...overrides,
  };
}

function makeReport(issues: Issue[] = []): Report {
  return {
    issues,
    summary: { total: issues.length, errors: 0, warnings: 0, infos: 0 },
  };
}

describe("buildBaseline", () => {
  it("creates a baseline with correct structure", () => {
    const report = makeReport([makeIssue()]);
    const baseline = buildBaseline(report);
    expect(baseline.version).toBe(1);
    expect(baseline.entries).toHaveLength(1);
    expect(baseline.entries[0].variable).toBe("API_KEY");
    expect(baseline.entries[0].fingerprint).toBeTruthy();
  });

  it("produces consistent fingerprints", () => {
    const issue = makeIssue();
    const b1 = buildBaseline(makeReport([issue]));
    const b2 = buildBaseline(makeReport([issue]));
    expect(b1.entries[0].fingerprint).toBe(b2.entries[0].fingerprint);
  });
});

describe("applyBaseline", () => {
  it("filters out issues present in the baseline", () => {
    const issue = makeIssue();
    const baseline = buildBaseline(makeReport([issue]));
    const report = makeReport([issue, makeIssue({ variable: "NEW_VAR" })]);
    const filtered = applyBaseline(report, baseline);
    expect(filtered.issues).toHaveLength(1);
    expect(filtered.issues[0].variable).toBe("NEW_VAR");
  });

  it("returns all issues when baseline is empty", () => {
    const baseline = buildBaseline(makeReport([]));
    const report = makeReport([makeIssue()]);
    const filtered = applyBaseline(report, baseline);
    expect(filtered.issues).toHaveLength(1);
  });
});

describe("formatBaseline", () => {
  it("returns valid JSON string", () => {
    const report = makeReport([makeIssue()]);
    const output = formatBaseline(report);
    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output);
    expect(parsed.version).toBe(1);
  });
});

describe("loadBaseline / saveBaseline", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "baseline-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns null when baseline file does not exist", () => {
    const result = loadBaseline(path.join(tmpDir, "nonexistent.json"));
    expect(result).toBeNull();
  });

  it("saves and loads a baseline correctly", () => {
    const report = makeReport([makeIssue()]);
    const baseline = buildBaseline(report);
    const filePath = path.join(tmpDir, "baseline.json");
    saveBaseline(baseline, filePath);
    const loaded = loadBaseline(filePath);
    expect(loaded).not.toBeNull();
    expect(loaded!.entries).toHaveLength(1);
    expect(loaded!.entries[0].variable).toBe("API_KEY");
  });

  it("throws on invalid JSON content", () => {
    const filePath = path.join(tmpDir, "bad.json");
    fs.writeFileSync(filePath, "not json");
    expect(() => loadBaseline(filePath)).toThrow("not valid JSON");
  });
});
