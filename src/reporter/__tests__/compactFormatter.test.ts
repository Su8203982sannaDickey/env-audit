import { formatCompact } from "../compactFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    scannedDir: "/project",
    generatedAt: "2024-01-01T00:00:00.000Z",
    issues,
    summary: {
      totalVariables: 5,
      totalIssues: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("formatCompact", () => {
  it("outputs a clean message when there are no issues", () => {
    const output = formatCompact(makeReport([]));
    expect(output).toContain("No issues found");
    expect(output).toContain("5 variables scanned");
  });

  it("includes severity symbol for error", () => {
    const report = makeReport([
      {
        type: "missing",
        severity: "error",
        variable: "DB_URL",
        message: "Missing in .env",
        locations: [{ file: ".env", line: 1 }],
      },
    ]);
    const output = formatCompact(report);
    expect(output).toContain("✖");
    expect(output).toContain("DB_URL");
    expect(output).toContain("[ERROR]");
  });

  it("includes severity symbol for warning", () => {
    const report = makeReport([
      {
        type: "duplicate",
        severity: "warning",
        variable: "API_KEY",
        message: "Duplicate key",
        locations: [],
      },
    ]);
    const output = formatCompact(report);
    expect(output).toContain("⚠");
    expect(output).toContain("[WARNING]");
  });

  it("shows (no location) when locations are empty", () => {
    const report = makeReport([
      {
        type: "undocumented",
        severity: "info",
        variable: "LOG_LEVEL",
        message: "Undocumented variable",
        locations: [],
      },
    ]);
    expect(formatCompact(report)).toContain("(no location)");
  });

  it("includes summary line with counts", () => {
    const report = makeReport([
      { type: "missing", severity: "error", variable: "X", message: "m", locations: [] },
      { type: "duplicate", severity: "warning", variable: "Y", message: "d", locations: [] },
    ]);
    const output = formatCompact(report);
    expect(output).toContain("errors: 1");
    expect(output).toContain("warnings: 1");
  });
});
