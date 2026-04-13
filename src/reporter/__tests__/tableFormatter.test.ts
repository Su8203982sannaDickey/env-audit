import { formatTable } from "../tableFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      totalIssues: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("formatTable", () => {
  it("renders headers and separator rows", () => {
    const report = makeReport([]);
    const output = formatTable(report);
    expect(output).toContain("Variable");
    expect(output).toContain("Severity");
    expect(output).toContain("Type");
    expect(output).toContain("Message");
    expect(output).toContain("Locations");
  });

  it("renders issue rows correctly", () => {
    const report = makeReport([
      {
        variable: "API_KEY",
        severity: "error",
        type: "missing",
        message: "API_KEY is missing from .env",
        locations: [{ file: ".env", line: 1 }],
      },
    ]);
    const output = formatTable(report);
    expect(output).toContain("API_KEY");
    expect(output).toContain("error");
    expect(output).toContain("missing");
    expect(output).toContain(".env:1");
  });

  it("shows dash for issues with no locations", () => {
    const report = makeReport([
      {
        variable: "DB_URL",
        severity: "warning",
        type: "undocumented",
        message: "DB_URL is undocumented",
        locations: [],
      },
    ]);
    const output = formatTable(report);
    expect(output).toContain("-");
  });

  it("includes summary line", () => {
    const report = makeReport([
      {
        variable: "SECRET",
        severity: "error",
        type: "missing",
        message: "SECRET missing",
        locations: [],
      },
    ]);
    const output = formatTable(report);
    expect(output).toContain("1 issue(s)");
    expect(output).toContain("1 error(s)");
    expect(output).toContain("0 warning(s)");
  });

  it("truncates long messages", () => {
    const longMsg = "A".repeat(100);
    const report = makeReport([
      {
        variable: "LONG_VAR",
        severity: "info",
        type: "undocumented",
        message: longMsg,
        locations: [],
      },
    ]);
    const output = formatTable(report);
    expect(output).toContain("...");
  });
});
