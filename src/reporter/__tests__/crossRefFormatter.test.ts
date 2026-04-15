import { formatCrossRef } from "../crossRefFormatter";
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

describe("formatCrossRef", () => {
  it("returns empty message when no issues", () => {
    const output = formatCrossRef(makeReport([]));
    expect(output).toContain("no issues");
  });

  it("renders header columns", () => {
    const report = makeReport([
      { variable: "PORT", type: "missing", severity: "error", message: "m", locations: [] },
    ]);
    const output = formatCrossRef(report);
    expect(output).toContain("Variable");
    expect(output).toContain("In .env");
    expect(output).toContain("In src");
  });

  it("marks missing variable as not defined in env", () => {
    const report = makeReport([
      { variable: "DB_HOST", type: "missing", severity: "error", message: "m", locations: [] },
    ]);
    const output = formatCrossRef(report);
    expect(output).toContain("✘");
    expect(output).toContain("DB_HOST");
  });

  it("marks undocumented variable as not used in source", () => {
    const report = makeReport([
      { variable: "LEGACY_KEY", type: "undocumented", severity: "info", message: "m", locations: [] },
    ]);
    const output = formatCrossRef(report);
    expect(output).toContain("LEGACY_KEY");
    expect(output).toContain("✘");
  });

  it("marks duplicate as both defined and used", () => {
    const report = makeReport([
      { variable: "API_URL", type: "duplicate", severity: "warning", message: "m", locations: [] },
    ]);
    const output = formatCrossRef(report);
    const checkCount = (output.match(/✔/g) || []).length;
    expect(checkCount).toBeGreaterThanOrEqual(2);
  });

  it("includes severity in each row", () => {
    const report = makeReport([
      { variable: "SECRET", type: "missing", severity: "error", message: "m", locations: [] },
    ]);
    const output = formatCrossRef(report);
    expect(output).toContain("[error]");
  });
});
