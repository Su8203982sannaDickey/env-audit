import { sortIssues, formatSort, SortField, SortOrder } from "../sortFormatter";
import { Issue, Report } from "../types";

function makeIssue(overrides: Partial<Issue>): Issue {
  return {
    type: "missing",
    severity: "warning",
    variable: "VAR",
    message: "test",
    locations: [],
    ...overrides,
  };
}

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      total: issues.length,
      errors: 0,
      warnings: 0,
      infos: 0,
    },
  };
}

describe("sortIssues", () => {
  it("sorts by severity asc (error < warning < info)", () => {
    const issues = [
      makeIssue({ severity: "info", variable: "C" }),
      makeIssue({ severity: "error", variable: "A" }),
      makeIssue({ severity: "warning", variable: "B" }),
    ];
    const sorted = sortIssues(issues, "severity", "asc");
    expect(sorted.map((i) => i.severity)).toEqual(["error", "warning", "info"]);
  });

  it("sorts by severity desc", () => {
    const issues = [
      makeIssue({ severity: "error" }),
      makeIssue({ severity: "info" }),
    ];
    const sorted = sortIssues(issues, "severity", "desc");
    expect(sorted[0].severity).toBe("info");
  });

  it("sorts by variable alphabetically asc", () => {
    const issues = [
      makeIssue({ variable: "ZEBRA" }),
      makeIssue({ variable: "ALPHA" }),
      makeIssue({ variable: "MANGO" }),
    ];
    const sorted = sortIssues(issues, "variable", "asc");
    expect(sorted.map((i) => i.variable)).toEqual(["ALPHA", "MANGO", "ZEBRA"]);
  });

  it("sorts by type asc", () => {
    const issues = [
      makeIssue({ type: "undocumented" }),
      makeIssue({ type: "duplicate" }),
      makeIssue({ type: "missing" }),
    ];
    const sorted = sortIssues(issues, "type", "asc");
    expect(sorted[0].type).toBe("duplicate");
  });

  it("sorts by file asc", () => {
    const issues = [
      makeIssue({ locations: [{ file: "z.ts", line: 1 }] }),
      makeIssue({ locations: [{ file: "a.ts", line: 1 }] }),
    ];
    const sorted = sortIssues(issues, "file", "asc");
    expect(sorted[0].locations?.[0]?.file).toBe("a.ts");
  });

  it("does not mutate the original array", () => {
    const issues = [
      makeIssue({ variable: "B" }),
      makeIssue({ variable: "A" }),
    ];
    const original = [...issues];
    sortIssues(issues, "variable", "asc");
    expect(issues[0].variable).toBe(original[0].variable);
  });
});

describe("formatSort", () => {
  it("returns a new report with sorted issues", () => {
    const issues = [
      makeIssue({ severity: "info" }),
      makeIssue({ severity: "error" }),
    ];
    const report = makeReport(issues);
    const result = formatSort(report, "severity", "asc");
    expect(result.issues[0].severity).toBe("error");
    expect(result.summary).toEqual(report.summary);
  });
});
