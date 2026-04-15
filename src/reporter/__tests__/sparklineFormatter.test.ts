import { formatSparkline, buildSparkline } from "../sparklineFormatter";
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

describe("buildSparkline", () => {
  it("returns empty string for empty values", () => {
    expect(buildSparkline([])).toBe("");
  });

  it("returns lowest bar for all-zero values", () => {
    const result = buildSparkline([0, 0, 0]);
    expect(result).toBe("▁▁▁");
  });

  it("returns highest bar for max value", () => {
    const result = buildSparkline([0, 0, 8]);
    expect(result[2]).toBe("█");
  });

  it("produces correct length output", () => {
    expect(buildSparkline([1, 2, 3, 4]).length).toBe(4);
  });
});

describe("formatSparkline", () => {
  it("shows no issues message when empty", () => {
    const output = formatSparkline(makeReport([]));
    expect(output).toContain("Total: 0 issue(s)");
  });

  it("includes severity counts", () => {
    const report = makeReport([
      { variable: "A", type: "missing", severity: "error", message: "msg" },
      { variable: "B", type: "duplicate", severity: "warning", message: "msg" },
    ]);
    const output = formatSparkline(report);
    expect(output).toContain("errors(1)");
    expect(output).toContain("warnings(1)");
    expect(output).toContain("infos(0)");
  });

  it("lists issue types", () => {
    const report = makeReport([
      { variable: "X", type: "undocumented", severity: "info", message: "msg" },
      { variable: "Y", type: "undocumented", severity: "info", message: "msg" },
      { variable: "Z", type: "missing", severity: "error", message: "msg" },
    ]);
    const output = formatSparkline(report);
    expect(output).toContain("undocumented");
    expect(output).toContain("missing");
  });

  it("shows correct total", () => {
    const report = makeReport([
      { variable: "A", type: "missing", severity: "error", message: "msg" },
      { variable: "B", type: "missing", severity: "error", message: "msg" },
      { variable: "C", type: "missing", severity: "error", message: "msg" },
    ]);
    const output = formatSparkline(report);
    expect(output).toContain("Total: 3 issue(s)");
  });

  it("includes sparkline header", () => {
    const output = formatSparkline(makeReport([]));
    expect(output).toContain("env-audit sparkline summary");
  });
});
