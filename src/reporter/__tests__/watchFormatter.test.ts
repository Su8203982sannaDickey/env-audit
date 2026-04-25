import { formatWatch, buildSnapshot, fingerprintIssue } from "../watchFormatter";
import { Report, Issue } from "../types";

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    type: "missing",
    variable: "API_KEY",
    severity: "error",
    message: "Missing env variable",
    locations: [],
    ...overrides,
  };
}

function makeReport(issues: Issue[] = []): Report {
  return {
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("fingerprintIssue", () => {
  it("produces a stable key from type, variable, severity", () => {
    const issue = makeIssue();
    expect(fingerprintIssue(issue)).toBe("missing:API_KEY:error");
  });

  it("produces distinct keys for issues differing only in variable", () => {
    const a = makeIssue({ variable: "FOO" });
    const b = makeIssue({ variable: "BAR" });
    expect(fingerprintIssue(a)).not.toBe(fingerprintIssue(b));
  });

  it("produces distinct keys for issues differing only in severity", () => {
    const a = makeIssue({ severity: "error" });
    const b = makeIssue({ severity: "warning" });
    expect(fingerprintIssue(a)).not.toBe(fingerprintIssue(b));
  });
});

describe("buildSnapshot", () => {
  it("counts issues by type and severity", () => {
    const report = makeReport([
      makeIssue({ type: "missing", severity: "error" }),
      makeIssue({ variable: "DB_URL", type: "duplicate", severity: "warning" }),
    ]);
    const snap = buildSnapshot(report);
    expect(snap.totalIssues).toBe(2);
    expect(snap.byType["missing"]).toBe(1);
    expect(snap.byType["duplicate"]).toBe(1);
    expect(snap.bySeverity["error"]).toBe(1);
    expect(snap.bySeverity["warning"]).toBe(1);
  });

  it("detects new and resolved issues against previous fingerprints", () => {
    const prev = new Set(["missing:OLD_KEY:error"]);
    const report = makeReport([makeIssue()]);
    const snap = buildSnapshot(report, prev);
    expect(snap.newIssues).toContain("missing:API_KEY:error");
    expect(snap.resolvedIssues).toContain("missing:OLD_KEY:error");
  });

  it("returns empty newIssues and resolvedIssues when no previous fingerprints given", () => {
    const report = makeReport([makeIssue()]);
    const snap = buildSnapshot(report);
    expect(snap.newIssues).toHaveLength(0);
    expect(snap.resolvedIssues).toHaveLength(0);
  });
});

describe("formatWatch", () => {
  it("includes timestamp and total issues", () => {
    const report = makeReport([makeIssue()]);
    const output = formatWatch(report);
    expect(output).toMatch(/\[Watch\]/);
    expect(output).toMatch(/Total issues: 1/);
  });

  it("shows new issues when previous fingerprints provided", () => {
    const prev = new Set<string>();
    const report = makeReport([makeIssue()]);
    const output = formatWatch(report, prev);
    expect(output).toMatch(/New issues \(\+1\)/);
    expect(output).toContain("+ missing:API_KEY:error");
  });

  it("shows resolved issues", () => {
    const prev = new Set(["missing:API_KEY:error"]);
    const report = makeReport([]);
    const output = formatWatch(report, prev);
    expect(output).toMatch(/Resolved issues \(-1\)/);
    expect(output).toContain("- missing:API_KEY:error");
  });

  it("omits diff section when no previous fingerprints given", () => {
    const report = makeReport([makeIssue()]);
    const output = formatWatch(report);
    expect(output).not.toMatch(/New issues/);
    expect(output).not.toMatch(/Resolved issues/);
  });

  it("reports zero total issues for an empty report", () => {
    const report = makeReport([]);
    const output = formatWatch(report);
    expect(output).toMatch(/Total issues: 0/);
  });
});
