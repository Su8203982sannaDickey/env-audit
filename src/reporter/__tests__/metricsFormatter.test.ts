import { computeMetrics, formatMetrics } from "../metricsFormatter";
import { Report } from "../types";

function makeReport(): Report {
  return {
    issues: [
      {
        type: "missing",
        severity: "error",
        variable: "DB_URL",
        message: "Missing",
        locations: [{ file: "src/db.ts", line: 5 }],
      },
      {
        type: "duplicate",
        severity: "warning",
        variable: "API_KEY",
        message: "Duplicate",
        locations: [
          { file: ".env", line: 2 },
          { file: ".env.local", line: 1 },
        ],
      },
      {
        type: "undocumented",
        severity: "info",
        variable: "FEATURE_X",
        message: "Undocumented",
        locations: [{ file: "src/feature.ts", line: 8 }],
      },
    ],
    summary: { totalIssues: 3, missing: 1, duplicates: 1, undocumented: 1 },
  };
}

/** Returns a Report where all issues share the same variable name, useful for testing deduplication. */
function makeReportWithDuplicateVariables(): Report {
  return {
    issues: [
      {
        type: "missing",
        severity: "error",
        variable: "DB_URL",
        message: "Missing in prod",
        locations: [{ file: "src/db.ts", line: 5 }],
      },
      {
        type: "duplicate",
        severity: "warning",
        variable: "DB_URL",
        message: "Duplicate in env files",
        locations: [{ file: ".env", line: 2 }],
      },
    ],
    summary: { totalIssues: 2, missing: 1, duplicates: 1, undocumented: 0 },
  };
}

describe("computeMetrics", () => {
  it("counts severities correctly", () => {
    const m = computeMetrics(makeReport());
    expect(m.errorCount).toBe(1);
    expect(m.warningCount).toBe(1);
    expect(m.infoCount).toBe(1);
  });

  it("counts affected files across all locations", () => {
    const m = computeMetrics(makeReport());
    // src/db.ts, .env, .env.local, src/feature.ts
    expect(m.affectedFiles).toBe(4);
  });

  it("counts unique variables", () => {
    const m = computeMetrics(makeReport());
    expect(m.affectedVariables).toBe(3);
  });

  it("deduplicates variables that appear in multiple issues", () => {
    const m = computeMetrics(makeReportWithDuplicateVariables());
    expect(m.affectedVariables).toBe(1);
  });

  it("computes errorRate between 0 and 1", () => {
    const m = computeMetrics(makeReport());
    expect(m.errorRate).toBeGreaterThan(0);
    expect(m.errorRate).toBeLessThanOrEqual(1);
  });

  it("handles empty issue list", () => {
    const empty: Report = {
      issues: [],
      summary: { totalIssues: 0, missing: 0, duplicates: 0, undocumented: 0 },
    };
    const m = computeMetrics(empty);
    expect(m.totalIssues).toBe(0);
    expect(m.issuesPerFile).toBe(0);
    expect(m.errorRate).toBe(0);
  });
});

describe("formatMetrics", () => {
  it("includes all metric labels", () => {
    const output = formatMetrics(makeReport());
    expect(output).toContain("totalIssues");
    expect(output).toContain("errorCount");
    expect(output).toContain("affectedFiles");
    expect(output).toContain("errorRate");
  });

  it("formats errorRate as a percentage", () => {
    const output = formatMetrics(makeReport());
    expect(output).toMatch(/errorRate\s+:\s+\d+\.\d%/);
  });
});
