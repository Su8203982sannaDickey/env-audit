import { shouldRedact, redactIssue, formatRedact } from "../redactFormatter";
import { parseRedactConfig } from "../redactLoader";
import { Report, Issue } from "../types";

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    variable: "DB_HOST",
    type: "missing",
    severity: "error",
    message: "Variable `DB_HOST` is missing from .env",
    locations: [{ file: "src/app.ts", line: 10 }],
    ...overrides,
  };
}

function makeReport(issues: Issue[] = []): Report {
  return {
    issues,
    summary: {
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("shouldRedact", () => {
  it("returns true for sensitive variable names", () => {
    expect(shouldRedact("DB_PASSWORD")).toBe(true);
    expect(shouldRedact("API_SECRET")).toBe(true);
    expect(shouldRedact("AUTH_TOKEN")).toBe(true);
    expect(shouldRedact("PRIVATE_KEY")).toBe(true);
  });

  it("returns false for non-sensitive variable names", () => {
    expect(shouldRedact("DB_HOST")).toBe(false);
    expect(shouldRedact("PORT")).toBe(false);
    expect(shouldRedact("NODE_ENV")).toBe(false);
  });

  it("uses custom patterns when provided", () => {
    expect(shouldRedact("MY_CUSTOM_VAR", [/custom/i])).toBe(true);
    expect(shouldRedact("DB_HOST", [/custom/i])).toBe(false);
  });
});

describe("redactIssue", () => {
  it("does not alter non-sensitive issues", () => {
    const issue = makeIssue({ variable: "PORT" });
    expect(redactIssue(issue)).toEqual(issue);
  });

  it("redacts message content for sensitive variables", () => {
    const issue = makeIssue({
      variable: "DB_PASSWORD",
      message: "Variable `DB_PASSWORD` is missing",
    });
    const result = redactIssue(issue);
    expect(result.message).toContain("[REDACTED]");
    expect(result.message).not.toContain("DB_PASSWORD");
  });
});

describe("formatRedact", () => {
  it("renders a report with redacted sensitive variables", () => {
    const issues = [
      makeIssue({ variable: "DB_PASSWORD", message: "Variable `DB_PASSWORD` missing" }),
      makeIssue({ variable: "PORT", severity: "warning", message: "Variable `PORT` undocumented" }),
    ];
    const report = makeReport(issues);
    const output = formatRedact(report);
    expect(output).toContain("[REDACTED]");
    expect(output).toContain("PORT");
    expect(output).not.toContain("DB_PASSWORD");
    expect(output).toContain("Total issues: 2");
  });

  it("includes summary line", () => {
    const report = makeReport([makeIssue()]);
    const output = formatRedact(report);
    expect(output).toContain("Summary:");
  });
});

describe("parseRedactConfig", () => {
  it("returns default config for invalid input", () => {
    expect(parseRedactConfig(null).patterns.length).toBeGreaterThan(0);
    expect(parseRedactConfig("string").patterns.length).toBeGreaterThan(0);
  });

  it("merges extra patterns from config", () => {
    const config = parseRedactConfig({ patterns: ["custom_sensitive"] });
    expect(config.patterns.some((p) => p.test("MY_CUSTOM_SENSITIVE_VAR"))).toBe(true);
  });

  it("ignores invalid regex strings", () => {
    const config = parseRedactConfig({ patterns: ["["] });
    expect(config.patterns).toBeDefined();
  });
});
