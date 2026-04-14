import { formatNdjson } from "../ndjsonFormatter";
import { Report, Issue } from "../types";

function makeReport(overrides: Partial<Report> = {}): Report {
  const issues: Issue[] = [
    {
      type: "missing",
      severity: "error",
      variable: "DATABASE_URL",
      message: "DATABASE_URL is used in source but missing from .env files",
      locations: [{ file: "src/db.ts", line: 12 }],
    },
    {
      type: "duplicate",
      severity: "warning",
      variable: "API_KEY",
      message: "API_KEY is defined in multiple .env files",
      locations: [
        { file: ".env", line: 3 },
        { file: ".env.local", line: 1 },
      ],
    },
    {
      type: "undocumented",
      severity: "info",
      variable: "DEBUG",
      message: "DEBUG is defined in .env but not used in source code",
      locations: [],
    },
  ];

  return {
    issues,
    summary: {
      totalIssues: 3,
      errors: 1,
      warnings: 1,
      info: 1,
      scannedFiles: 5,
      envFiles: 2,
    },
    ...overrides,
  };
}

describe("formatNdjson", () => {
  it("outputs one JSON object per line", () => {
    const output = formatNdjson(makeReport());
    const lines = output.trim().split("\n");
    expect(lines).toHaveLength(4); // 1 summary + 3 issues
    lines.forEach((line) => expect(() => JSON.parse(line)).not.toThrow());
  });

  it("first line is the summary record", () => {
    const output = formatNdjson(makeReport());
    const summary = JSON.parse(output.split("\n")[0]);
    expect(summary.type).toBe("summary");
    expect(summary.totalIssues).toBe(3);
    expect(summary.errors).toBe(1);
    expect(summary.warnings).toBe(1);
    expect(summary.info).toBe(1);
    expect(summary.scannedFiles).toBe(5);
    expect(summary.envFiles).toBe(2);
  });

  it("subsequent lines are issue records with correct shape", () => {
    const output = formatNdjson(makeReport());
    const lines = output.trim().split("\n");
    const firstIssue = JSON.parse(lines[1]);
    expect(firstIssue.type).toBe("issue");
    expect(firstIssue.severity).toBe("error");
    expect(firstIssue.variable).toBe("DATABASE_URL");
    expect(firstIssue.locations).toEqual([{ file: "src/db.ts", line: 12 }]);
  });

  it("handles issues with no locations", () => {
    const output = formatNdjson(makeReport());
    const lines = output.trim().split("\n");
    const undocumented = JSON.parse(lines[3]);
    expect(undocumented.variable).toBe("DEBUG");
    expect(undocumented.locations).toEqual([]);
  });

  it("ends with a trailing newline", () => {
    const output = formatNdjson(makeReport());
    expect(output.endsWith("\n")).toBe(true);
  });

  it("handles an empty issues list", () => {
    const report = makeReport({ issues: [], summary: { totalIssues: 0, errors: 0, warnings: 0, info: 0, scannedFiles: 2, envFiles: 1 } });
    const output = formatNdjson(report);
    const lines = output.trim().split("\n");
    expect(lines).toHaveLength(1);
    const summary = JSON.parse(lines[0]);
    expect(summary.type).toBe("summary");
    expect(summary.totalIssues).toBe(0);
  });
});
