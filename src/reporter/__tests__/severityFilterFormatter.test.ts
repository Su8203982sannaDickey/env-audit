import {
  filterBySeverity,
  formatSeverityFilter,
  meetsMinSeverity,
  normalizeSeverity,
} from "../severityFilterFormatter";
import { Report, Issue } from "../types";

function makeIssue(severity: string, variable = "VAR"): Issue {
  return {
    type: "missing",
    severity: severity as any,
    variable,
    message: `Issue with ${variable}`,
    locations: [],
  };
}

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: { total: issues.length, byType: {}, bySeverity: {} },
  };
}

describe("normalizeSeverity", () => {
  it("returns known severities as-is", () => {
    expect(normalizeSeverity("error")).toBe("error");
    expect(normalizeSeverity("warning")).toBe("warning");
    expect(normalizeSeverity("info")).toBe("info");
  });

  it("falls back to info for unknown values", () => {
    expect(normalizeSeverity("critical")).toBe("info");
    expect(normalizeSeverity("")).toBe("info");
  });
});

describe("meetsMinSeverity", () => {
  it("passes errors for min=warning", () => {
    expect(meetsMinSeverity(makeIssue("error"), "warning")).toBe(true);
  });

  it("blocks info for min=warning", () => {
    expect(meetsMinSeverity(makeIssue("info"), "warning")).toBe(false);
  });
});

describe("filterBySeverity", () => {
  const issues = [
    makeIssue("error", "A"),
    makeIssue("warning", "B"),
    makeIssue("info", "C"),
  ];

  it("filters by minSeverity", () => {
    const result = filterBySeverity(issues, { minSeverity: "warning" });
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.variable)).toEqual(["A", "B"]);
  });

  it("filters by only list", () => {
    const result = filterBySeverity(issues, { only: ["error"] });
    expect(result).toHaveLength(1);
    expect(result[0].variable).toBe("A");
  });

  it("filters by exclude list", () => {
    const result = filterBySeverity(issues, { exclude: ["info"] });
    expect(result).toHaveLength(2);
  });

  it("returns all issues when no options given", () => {
    expect(filterBySeverity(issues, {})).toHaveLength(3);
  });
});

describe("formatSeverityFilter", () => {
  it("returns a report with filtered issues and updated total", () => {
    const report = makeReport([
      makeIssue("error", "X"),
      makeIssue("info", "Y"),
    ]);
    const result = formatSeverityFilter(report, { minSeverity: "error" });
    expect(result.issues).toHaveLength(1);
    expect(result.summary.total).toBe(1);
  });
});
