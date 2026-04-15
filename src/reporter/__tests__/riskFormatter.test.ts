import { formatRisk } from "../riskFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Partial<Issue>[] = []): Report {
  const full: Issue[] = issues.map((i, idx) => ({
    variable: i.variable ?? `VAR_${idx}`,
    type: i.type ?? "missing",
    severity: i.severity ?? "error",
    message: i.message ?? "test issue",
    locations: i.locations ?? [],
  }));
  return {
    issues: full,
    summary: {
      totalIssues: full.length,
      errors: full.filter((i) => i.severity === "error").length,
      warnings: full.filter((i) => i.severity === "warning").length,
      infos: full.filter((i) => i.severity === "info").length,
      scannedFiles: 5,
    },
  };
}

describe("formatRisk", () => {
  it("outputs header", () => {
    const report = makeReport([]);
    const output = formatRisk(report);
    expect(output).toContain("# Risk Assessment Report");
  });

  it("classifies missing+error as critical", () => {
    const report = makeReport([{ variable: "DB_PASS", type: "missing", severity: "error" }]);
    const output = formatRisk(report);
    expect(output).toContain("CRITICAL");
    expect(output).toContain("DB_PASS");
  });

  it("classifies undocumented+info as low", () => {
    const report = makeReport([{ variable: "OPTIONAL_VAR", type: "undocumented", severity: "info" }]);
    const output = formatRisk(report);
    expect(output).toContain("LOW");
    expect(output).toContain("OPTIONAL_VAR");
  });

  it("includes reasons for each entry", () => {
    const report = makeReport([{ variable: "API_KEY", type: "missing", severity: "error" }]);
    const output = formatRisk(report);
    expect(output).toContain("variable is missing");
    expect(output).toContain("severity: error");
  });

  it("sorts entries by score descending", () => {
    const report = makeReport([
      { variable: "LOW_VAR", type: "undocumented", severity: "info" },
      { variable: "HIGH_VAR", type: "missing", severity: "error" },
    ]);
    const output = formatRisk(report);
    const highIdx = output.indexOf("HIGH_VAR");
    const lowIdx = output.indexOf("LOW_VAR");
    expect(highIdx).toBeLessThan(lowIdx);
  });

  it("shows total issues and scanned files", () => {
    const report = makeReport([{ variable: "X" }]);
    const output = formatRisk(report);
    expect(output).toContain("Total issues: 1");
    expect(output).toContain("5 files");
  });

  it("skips empty risk levels", () => {
    const report = makeReport([{ variable: "SOME_VAR", type: "missing", severity: "error" }]);
    const output = formatRisk(report);
    expect(output).not.toMatch(/## LOW/);
  });
});
