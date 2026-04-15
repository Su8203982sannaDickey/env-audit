import { formatSummary } from "../summaryFormatter";
import { Report, Issue } from "../types";

function makeReport(overrides: Partial<Report> = {}): Report {
  const issues: Issue[] = [
    {
      type: "missing",
      severity: "error",
      variable: "DATABASE_URL",
      message: "Missing in .env",
      locations: [],
    },
    {
      type: "duplicate",
      severity: "warning",
      variable: "API_KEY",
      message: "Duplicate key",
      locations: [{ file: ".env", line: 3 }],
    },
    {
      type: "undocumented",
      severity: "info",
      variable: "FEATURE_FLAG",
      message: "Undocumented usage",
      locations: [{ file: "src/app.ts", line: 12 }],
    },
  ];

  return {
    issues,
    summary: {
      totalIssues: 3,
      missing: 1,
      duplicates: 1,
      undocumented: 1,
    },
    ...overrides,
  };
}

describe("formatSummary", () => {
  it("renders totals from the summary block", () => {
    const output = formatSummary(makeReport());
    expect(output).toContain("Total Issues : 3");
    expect(output).toContain("Missing      : 1");
    expect(output).toContain("Duplicates   : 1");
    expect(output).toContain("Undocumented : 1");
  });

  it("renders severity breakdown", () => {
    const output = formatSummary(makeReport());
    expect(output).toContain("By Severity:");
    expect(output).toContain("error: 1");
    expect(output).toContain("warning: 1");
    expect(output).toContain("info: 1");
  });

  it("renders type breakdown", () => {
    const output = formatSummary(makeReport());
    expect(output).toContain("By Type:");
    expect(output).toContain("missing: 1");
    expect(output).toContain("duplicate: 1");
    expect(output).toContain("undocumented: 1");
  });

  it("shows clean message when no issues", () => {
    const report = makeReport({
      issues: [],
      summary: { totalIssues: 0, missing: 0, duplicates: 0, undocumented: 0 },
    });
    const output = formatSummary(report);
    expect(output).toContain("No issues found");
    expect(output).not.toContain("By Severity");
  });

  it("includes the tool header", () => {
    const output = formatSummary(makeReport());
    expect(output).toContain("env-audit Summary");
  });
});
