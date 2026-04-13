import { formatTap } from "../tapFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    scannedDir: "/project",
    generatedAt: "2024-06-01T12:00:00.000Z",
    issues,
    summary: {
      totalVariables: 4,
      totalIssues: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("formatTap", () => {
  it("outputs TAP version header", () => {
    const output = formatTap(makeReport([]));
    expect(output).toContain("TAP version 13");
  });

  it("outputs 1..0 plan for empty report", () => {
    const output = formatTap(makeReport([]));
    expect(output).toContain("1..0");
    expect(output).toContain("No issues found");
  });

  it("marks error issues as 'not ok'", () => {
    const report = makeReport([
      {
        type: "missing",
        severity: "error",
        variable: "SECRET",
        message: "Missing variable",
        locations: [{ file: ".env", line: 3 }],
      },
    ]);
    const output = formatTap(report);
    expect(output).toContain("not ok 1");
    expect(output).toContain("SECRET");
    expect(output).toContain("severity: error");
    expect(output).toContain("file: .env");
    expect(output).toContain("line: 3");
  });

  it("marks info issues as 'ok'", () => {
    const report = makeReport([
      {
        type: "undocumented",
        severity: "info",
        variable: "DEBUG",
        message: "Undocumented",
        locations: [],
      },
    ]);
    expect(formatTap(report)).toContain("ok 1");
  });

  it("includes correct plan count", () => {
    const issues: Issue[] = [
      { type: "missing", severity: "error", variable: "A", message: "m", locations: [] },
      { type: "duplicate", severity: "warning", variable: "B", message: "d", locations: [] },
      { type: "undocumented", severity: "info", variable: "C", message: "u", locations: [] },
    ];
    const output = formatTap(makeReport(issues));
    expect(output).toContain("1..3");
  });

  it("includes summary comment", () => {
    const report = makeReport([
      { type: "missing", severity: "error", variable: "X", message: "m", locations: [] },
    ]);
    const output = formatTap(report);
    expect(output).toContain("# summary:");
    expect(output).toContain("1 error(s)");
  });
});
