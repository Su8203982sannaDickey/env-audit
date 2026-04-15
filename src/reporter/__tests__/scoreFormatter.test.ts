import { computeScore, formatScore } from "../scoreFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Partial<Issue>[] = []): Report {
  const full: Issue[] = issues.map((i) => ({
    severity: "error",
    type: "missing",
    variable: "VAR",
    message: "Missing",
    locations: [],
    ...i,
  }));
  return {
    issues: full,
    summary: {
      errorCount: full.filter((i) => i.severity === "error").length,
      warnCount: full.filter((i) => i.severity === "warn").length,
      infoCount: full.filter((i) => i.severity === "info").length,
      totalFiles: 3,
      scannedAt: new Date(0).toISOString(),
    },
  };
}

describe("computeScore", () => {
  it("returns 100 for zero issues", () => {
    expect(computeScore(makeReport())).toBe(100);
  });

  it("reduces score for errors", () => {
    const score = computeScore(makeReport([{ severity: "error" }]));
    expect(score).toBeLessThan(100);
  });

  it("reduces score less for warnings than errors", () => {
    const errorScore = computeScore(makeReport([{ severity: "error" }]));
    const warnScore = computeScore(makeReport([{ severity: "warn" }]));
    expect(warnScore).toBeGreaterThan(errorScore);
  });

  it("does not go below 0", () => {
    const manyErrors = Array.from({ length: 50 }, () => ({ severity: "error" as const }));
    expect(computeScore(makeReport(manyErrors))).toBeGreaterThanOrEqual(0);
  });
});

describe("formatScore", () => {
  it("includes score heading", () => {
    const output = formatScore(makeReport());
    expect(output).toContain("Score");
  });

  it("shows 100 for clean project", () => {
    const output = formatScore(makeReport());
    expect(output).toContain("100");
  });

  it("shows grade label", () => {
    const output = formatScore(makeReport());
    expect(output).toMatch(/A|B|C|D|F/);
  });

  it("shows issue breakdown", () => {
    const report = makeReport([{ severity: "error" }, { severity: "warn" }]);
    const output = formatScore(report);
    expect(output).toContain("error");
    expect(output).toContain("warn");
  });
});
