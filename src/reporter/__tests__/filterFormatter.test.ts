import { applyFilters, formatFilter, FilterOptions } from "../filterFormatter";
import { Report, Issue } from "../types";

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    variable: "MY_VAR",
    type: "missing",
    severity: "error",
    message: "Variable is missing",
    locations: [{ file: "src/app.ts", line: 10 }],
    ...overrides,
  };
}

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

describe("applyFilters", () => {
  const issues = [
    makeIssue({ variable: "DB_URL", severity: "error", type: "missing" }),
    makeIssue({ variable: "API_KEY", severity: "warning", type: "undocumented" }),
    makeIssue({ variable: "PORT", severity: "info", type: "duplicate", locations: [{ file: "config/env.ts", line: 5 }] }),
  ];

  it("returns all issues when no filters applied", () => {
    expect(applyFilters(issues, {})).toHaveLength(3);
  });

  it("filters by severity", () => {
    const result = applyFilters(issues, { severity: ["error"] });
    expect(result).toHaveLength(1);
    expect(result[0].variable).toBe("DB_URL");
  });

  it("filters by multiple severities", () => {
    const result = applyFilters(issues, { severity: ["error", "warning"] });
    expect(result).toHaveLength(2);
  });

  it("filters by type", () => {
    const result = applyFilters(issues, { type: ["duplicate"] });
    expect(result).toHaveLength(1);
    expect(result[0].variable).toBe("PORT");
  });

  it("filters by file pattern", () => {
    const result = applyFilters(issues, { file: "config" });
    expect(result).toHaveLength(1);
    expect(result[0].variable).toBe("PORT");
  });

  it("filters by variable pattern", () => {
    const result = applyFilters(issues, { variable: "api" });
    expect(result).toHaveLength(1);
    expect(result[0].variable).toBe("API_KEY");
  });

  it("combines multiple filters", () => {
    const result = applyFilters(issues, { severity: ["error", "warning"], type: ["missing"] });
    expect(result).toHaveLength(1);
    expect(result[0].variable).toBe("DB_URL");
  });
});

describe("formatFilter", () => {
  it("shows no-match message when filters exclude all issues", () => {
    const report = makeReport([makeIssue({ severity: "error" })]);
    const output = formatFilter(report, { severity: ["info"] });
    expect(output).toContain("No issues match");
  });

  it("includes active filter description in header", () => {
    const report = makeReport([makeIssue()]);
    const output = formatFilter(report, { severity: ["error"], type: ["missing"] });
    expect(output).toContain("severity=error");
    expect(output).toContain("type=missing");
  });

  it("formats matching issues with location info", () => {
    const report = makeReport([makeIssue({ variable: "DB_URL", locations: [{ file: "src/db.ts", line: 3 }] })]);
    const output = formatFilter(report, {});
    expect(output).toContain("DB_URL");
    expect(output).toContain("src/db.ts:3");
  });

  it("shows total count at end", () => {
    const report = makeReport([makeIssue(), makeIssue({ variable: "OTHER" })]);
    const output = formatFilter(report, {});
    expect(output).toContain("Total: 2 issue(s)");
  });
});
