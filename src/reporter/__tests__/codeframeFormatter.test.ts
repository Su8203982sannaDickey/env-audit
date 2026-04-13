import { formatCodeframe } from "../codeframeFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      totalIssues: issues.length,
      errorCount: issues.filter((i) => i.severity === "error").length,
      warningCount: issues.filter((i) => i.severity === "warning").length,
      infoCount: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("formatCodeframe", () => {
  it("outputs header with summary counts", () => {
    const report = makeReport([]);
    const output = formatCodeframe(report);
    expect(output).toContain("env-audit codeframe report");
    expect(output).toContain("0 issue(s)");
  });

  it("shows 'No issues found' when there are no issues", () => {
    const report = makeReport([]);
    const output = formatCodeframe(report);
    expect(output).toContain("No issues found.");
  });

  it("formats an error issue with location", () => {
    const report = makeReport([
      {
        severity: "error",
        type: "missing",
        variable: "DB_HOST",
        message: "DB_HOST is missing from .env",
        locations: [{ file: "src/db.ts", line: 12 }],
      },
    ]);
    const output = formatCodeframe(report);
    expect(output).toContain("error: DB_HOST is missing from .env");
    expect(output).toContain("variable: DB_HOST");
    expect(output).toContain("--> src/db.ts:12");
    expect(output).toContain("12 | (source not available)");
  });

  it("formats a warning issue without line number", () => {
    const report = makeReport([
      {
        severity: "warning",
        type: "undocumented",
        variable: "SECRET_KEY",
        message: "SECRET_KEY is undocumented",
        locations: [{ file: ".env" }],
      },
    ]);
    const output = formatCodeframe(report);
    expect(output).toContain("warning: SECRET_KEY is undocumented");
    expect(output).toContain("--> .env");
    expect(output).not.toContain("| (source not available)");
  });

  it("handles multiple issues", () => {
    const report = makeReport([
      {
        severity: "error",
        type: "missing",
        variable: "API_KEY",
        message: "API_KEY missing",
        locations: [],
      },
      {
        severity: "info",
        type: "duplicate",
        variable: "PORT",
        message: "PORT is duplicated",
        locations: [],
      },
    ]);
    const output = formatCodeframe(report);
    expect(output).toContain("error: API_KEY missing");
    expect(output).toContain("info: PORT is duplicated");
    expect(output).toContain("2 issue(s)");
  });
});
