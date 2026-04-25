import { issueFingerprint, deduplicateIssues, formatDedup } from "../dedupFormatter";
import { Report, Issue } from "../types";

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    type: "missing",
    variable: "API_KEY",
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

describe("issueFingerprint", () => {
  it("produces consistent fingerprints for identical issues", () => {
    const a = makeIssue();
    const b = makeIssue();
    expect(issueFingerprint(a)).toBe(issueFingerprint(b));
  });

  it("produces different fingerprints for different variables", () => {
    const a = makeIssue({ variable: "API_KEY" });
    const b = makeIssue({ variable: "DB_URL" });
    expect(issueFingerprint(a)).not.toBe(issueFingerprint(b));
  });

  it("handles issues with no locations", () => {
    const issue = makeIssue({ locations: undefined });
    expect(() => issueFingerprint(issue)).not.toThrow();
    expect(issueFingerprint(issue)).toContain("missing::API_KEY");
  });
});

describe("deduplicateIssues", () => {
  it("returns same issues when there are no duplicates", () => {
    const issues = [
      makeIssue({ variable: "API_KEY" }),
      makeIssue({ variable: "DB_URL" }),
    ];
    expect(deduplicateIssues(issues)).toHaveLength(2);
  });

  it("removes duplicate issues", () => {
    const issue = makeIssue();
    const result = deduplicateIssues([issue, { ...issue }, { ...issue }]);
    expect(result).toHaveLength(1);
  });

  it("preserves first occurrence", () => {
    const a = makeIssue({ message: "first" });
    const b = makeIssue({ message: "second" });
    const result = deduplicateIssues([a, b]);
    expect(result[0].message).toBe("first");
  });
});

describe("formatDedup", () => {
  it("reports zero duplicates when all issues are unique", () => {
    const report = makeReport([
      makeIssue({ variable: "API_KEY" }),
      makeIssue({ variable: "DB_URL" }),
    ]);
    const output = formatDedup(report);
    expect(output).toContain("Duplicates removed      : 0");
    expect(output).toContain("No duplicates found.");
  });

  it("reports removed duplicates correctly", () => {
    const issue = makeIssue();
    const report = makeReport([issue, { ...issue }, { ...issue }]);
    const output = formatDedup(report);
    expect(output).toContain("Total issues (original) : 3");
    expect(output).toContain("Total issues (deduped)  : 1");
    expect(output).toContain("Duplicates removed      : 2");
    expect(output).toContain("API_KEY");
  });

  it("includes file location in unique issue list", () => {
    const issue = makeIssue({ locations: [{ file: "src/app.ts", line: 42 }] });
    const report = makeReport([issue, { ...issue }]);
    const output = formatDedup(report);
    expect(output).toContain("src/app.ts:42");
  });
});
