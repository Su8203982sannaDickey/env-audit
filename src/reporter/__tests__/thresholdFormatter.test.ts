import { describe, it, expect } from "vitest";
import {
  countBySeverity,
  evaluateThresholds,
  formatThreshold,
  ThresholdConfig,
} from "../thresholdFormatter";
import { Report, Issue } from "../types";

function makeIssue(severity: "error" | "warning" | "info"): Issue {
  return {
    type: "missing",
    key: `KEY_${severity.toUpperCase()}`,
    severity,
    message: `A ${severity} issue`,
    locations: [],
  };
}

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      totalIssues: issues.length,
      missingCount: 0,
      duplicateCount: 0,
      undocumentedCount: 0,
    },
  };
}

describe("countBySeverity", () => {
  it("counts correctly", () => {
    const issues = [
      makeIssue("error"),
      makeIssue("error"),
      makeIssue("warning"),
      makeIssue("info"),
    ];
    expect(countBySeverity(issues)).toEqual({ error: 2, warning: 1, info: 1 });
  });

  it("returns zeros for empty list", () => {
    expect(countBySeverity([])).toEqual({ error: 0, warning: 0, info: 0 });
  });
});

describe("evaluateThresholds", () => {
  it("passes when all counts are within thresholds", () => {
    const issues = [makeIssue("error"), makeIssue("warning")];
    const result = evaluateThresholds(issues, { maxErrors: 2, maxWarnings: 2 });
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("fails when error count exceeds threshold", () => {
    const issues = [makeIssue("error"), makeIssue("error"), makeIssue("error")];
    const result = evaluateThresholds(issues, { maxErrors: 2 });
    expect(result.passed).toBe(false);
    expect(result.violations[0]).toMatch(/Error count 3 exceeds threshold 2/);
  });

  it("fails when total exceeds threshold", () => {
    const issues = [makeIssue("info"), makeIssue("info"), makeIssue("info")];
    const result = evaluateThresholds(issues, { maxTotal: 2 });
    expect(result.passed).toBe(false);
    expect(result.violations[0]).toMatch(/Total issue count 3 exceeds threshold 2/);
  });

  it("reports multiple violations", () => {
    const issues = [makeIssue("error"), makeIssue("warning"), makeIssue("warning")];
    const result = evaluateThresholds(issues, { maxErrors: 0, maxWarnings: 1 });
    expect(result.violations).toHaveLength(2);
  });
});

describe("formatThreshold", () => {
  it("outputs PASSED when within limits", () => {
    const report = makeReport([makeIssue("info")]);
    const output = formatThreshold(report, { maxInfos: 5 });
    expect(output).toContain("PASSED");
    expect(output).toContain("info: 1");
  });

  it("outputs FAILED with violations listed", () => {
    const report = makeReport([makeIssue("error"), makeIssue("error")]);
    const output = formatThreshold(report, { maxErrors: 1 });
    expect(output).toContain("FAILED");
    expect(output).toContain("✖");
    expect(output).toContain("Error count 2 exceeds threshold 1");
  });

  it("works with no config (no thresholds set)", () => {
    const report = makeReport([makeIssue("error")]);
    const output = formatThreshold(report);
    expect(output).toContain("PASSED");
  });
});
