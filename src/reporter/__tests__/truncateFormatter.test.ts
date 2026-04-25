import { applyTruncation, formatTruncate, truncateString, truncateIssue } from "../truncateFormatter";
import { AuditReport, Issue } from "../types";

function makeIssue(variable: string, overrides: Partial<Issue> = {}): Issue {
  return {
    type: "missing",
    severity: "error",
    variable,
    message: `Variable ${variable} is missing`,
    locations: [{ file: "src/app.ts", line: 10 }],
    ...overrides,
  };
}

function makeReport(issues: Issue[]): AuditReport {
  return {
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
      notes: undefined,
    },
  };
}

describe("truncateString", () => {
  it("returns the original string if within limit", () => {
    expect(truncateString("SHORT", 10, "...")).toBe("SHORT");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(truncateString("TOOLONGSTRING", 8, "...")).toBe("TOOLON...");
  });

  it("handles exact length", () => {
    expect(truncateString("EXACT", 5, "...")).toBe("EXACT");
  });
});

describe("truncateIssue", () => {
  it("truncates variable name if too long", () => {
    const issue = makeIssue("A".repeat(80));
    const result = truncateIssue(issue, { maxIssues: 50, maxLocations: 5, maxVariableLength: 10, ellipsis: "..." });
    expect(result.variable.length).toBe(10);
    expect(result.variable.endsWith("...")).toBe(true);
  });

  it("truncates locations if over maxLocations", () => {
    const issue = makeIssue("VAR", {
      locations: Array.from({ length: 8 }, (_, i) => ({ file: `file${i}.ts`, line: i + 1 })),
    });
    const result = truncateIssue(issue, { maxIssues: 50, maxLocations: 3, maxVariableLength: 64, ellipsis: "..." });
    expect(result.locations).toHaveLength(4);
    expect(result.locations[3].file).toBe("...");
  });

  it("does not modify issue within limits", () => {
    const issue = makeIssue("NORMAL_VAR");
    const result = truncateIssue(issue, { maxIssues: 50, maxLocations: 5, maxVariableLength: 64, ellipsis: "..." });
    expect(result.variable).toBe("NORMAL_VAR");
    expect(result.locations).toHaveLength(1);
  });
});

describe("applyTruncation", () => {
  it("limits the number of issues", () => {
    const issues = Array.from({ length: 10 }, (_, i) => makeIssue(`VAR_${i}`));
    const report = makeReport(issues);
    const result = applyTruncation(report, { maxIssues: 3 });
    expect(result.issues).toHaveLength(3);
  });

  it("adds a truncation note when issues are cut", () => {
    const issues = Array.from({ length: 10 }, (_, i) => makeIssue(`VAR_${i}`));
    const report = makeReport(issues);
    const result = applyTruncation(report, { maxIssues: 5 });
    expect(result.summary.notes).toMatch(/truncated/);
    expect(result.summary.notes).toMatch(/5 of 10/);
  });

  it("does not add a note when under the limit", () => {
    const issues = [makeIssue("VAR_1"), makeIssue("VAR_2")];
    const report = makeReport(issues);
    const result = applyTruncation(report, { maxIssues: 50 });
    expect(result.summary.notes).toBeUndefined();
  });
});

describe("formatTruncate", () => {
  it("formats issues as truncated lines", () => {
    const issues = [makeIssue("API_KEY"), makeIssue("DB_URL", { severity: "warning", type: "undocumented" })];
    const report = makeReport(issues);
    const output = formatTruncate(report);
    expect(output).toContain("[error] API_KEY");
    expect(output).toContain("[warning] DB_URL");
  });

  it("includes truncation note in output", () => {
    const issues = Array.from({ length: 10 }, (_, i) => makeIssue(`VAR_${i}`));
    const report = makeReport(issues);
    const output = formatTruncate(report, { maxIssues: 2 });
    expect(output).toContain("[truncate]");
  });
});
