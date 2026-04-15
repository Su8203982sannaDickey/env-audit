import { formatTrend } from "../trendFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
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

describe("formatTrend", () => {
  it("returns no-issues message for empty report", () => {
    const output = formatTrend(makeReport([]));
    expect(output).toContain("No issues found.");
    expect(output).toContain("env-audit trend report");
  });

  it("includes variable name in output", () => {
    const report = makeReport([
      {
        variable: "DATABASE_URL",
        type: "missing",
        severity: "error",
        message: "Missing variable",
        locations: [{ file: "src/index.ts", line: 10 }],
      },
    ]);
    const output = formatTrend(report);
    expect(output).toContain("DATABASE_URL");
    expect(output).toContain("error");
    expect(output).toContain("missing");
  });

  it("sorts by occurrences descending", () => {
    const report = makeReport([
      {
        variable: "LOW_COUNT",
        type: "undocumented",
        severity: "info",
        message: "Undocumented",
        locations: [{ file: "a.ts", line: 1 }],
      },
      {
        variable: "HIGH_COUNT",
        type: "duplicate",
        severity: "warning",
        message: "Duplicate",
        locations: [
          { file: "a.ts", line: 1 },
          { file: "b.ts", line: 2 },
          { file: "c.ts", line: 3 },
        ],
      },
    ]);
    const output = formatTrend(report);
    const highPos = output.indexOf("HIGH_COUNT");
    const lowPos = output.indexOf("LOW_COUNT");
    expect(highPos).toBeLessThan(lowPos);
  });

  it("includes total summary line", () => {
    const report = makeReport([
      {
        variable: "API_KEY",
        type: "missing",
        severity: "error",
        message: "Missing",
        locations: [{ file: "x.ts", line: 5 }],
      },
    ]);
    const output = formatTrend(report);
    expect(output).toContain("Total issues: 1");
    expect(output).toContain("Total occurrences: 1");
  });

  it("handles issue with no locations gracefully", () => {
    const report = makeReport([
      {
        variable: "SECRET",
        type: "missing",
        severity: "error",
        message: "Missing variable",
      },
    ]);
    const output = formatTrend(report);
    expect(output).toContain("SECRET");
    expect(output).toContain("1");
  });
});
