import { formatGrouped } from "../groupedFormatter";
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

describe("formatGrouped", () => {
  it("includes header and summary line", () => {
    const report = makeReport([]);
    const output = formatGrouped(report);
    expect(output).toContain("env-audit grouped report");
    expect(output).toContain("Total: 0");
  });

  it("shows 'No issues found' for empty report", () => {
    const report = makeReport([]);
    expect(formatGrouped(report)).toContain("No issues found.");
  });

  it("groups issues by severity", () => {
    const report = makeReport([
      {
        severity: "error",
        type: "missing",
        variable: "DB_URL",
        message: "DB_URL is missing",
        locations: [{ file: "src/app.ts", line: 5 }],
      },
      {
        severity: "warning",
        type: "undocumented",
        variable: "TOKEN",
        message: "TOKEN is undocumented",
        locations: [],
      },
    ]);
    const output = formatGrouped(report);
    expect(output).toContain("[ERROR] (1)");
    expect(output).toContain("[WARNING] (1)");
    expect(output).toContain("DB_URL: DB_URL is missing");
    expect(output).toContain("TOKEN: TOKEN is undocumented");
  });

  it("formats location with line number", () => {
    const report = makeReport([
      {
        severity: "info",
        type: "duplicate",
        variable: "PORT",
        message: "PORT duplicated",
        locations: [{ file: ".env", line: 3 }],
      },
    ]);
    const output = formatGrouped(report);
    expect(output).toContain(".env:3");
  });

  it("shows 'no location' when locations array is empty", () => {
    const report = makeReport([
      {
        severity: "warning",
        type: "missing",
        variable: "SECRET",
        message: "SECRET missing",
        locations: [],
      },
    ]);
    const output = formatGrouped(report);
    expect(output).toContain("no location");
  });
});
