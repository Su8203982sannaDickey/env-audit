import { formatCategory, categorizeIssue, groupByCategory } from "../categoryFormatter";
import { Report, Issue } from "../types";

function makeIssue(variable: string, overrides: Partial<Issue> = {}): Issue {
  return {
    type: "missing",
    severity: "error",
    variable,
    message: `Missing variable ${variable}`,
    locations: [{ file: ".env", line: 1 }],
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

describe("categorizeIssue", () => {
  it("categorizes auth variables", () => {
    expect(categorizeIssue(makeIssue("JWT_SECRET"))).toBe("auth");
    expect(categorizeIssue(makeIssue("API_KEY"))).toBe("auth");
    expect(categorizeIssue(makeIssue("DB_PASSWORD"))).toBe("auth");
  });

  it("categorizes database variables", () => {
    expect(categorizeIssue(makeIssue("DATABASE_URL"))).toBe("database");
    expect(categorizeIssue(makeIssue("MONGO_URI"))).toBe("database");
    expect(categorizeIssue(makeIssue("REDIS_HOST"))).toBe("database");
  });

  it("categorizes network variables", () => {
    expect(categorizeIssue(makeIssue("PORT"))).toBe("network");
    expect(categorizeIssue(makeIssue("BASE_URL"))).toBe("network");
    expect(categorizeIssue(makeIssue("PROXY_HOST"))).toBe("network");
  });

  it("categorizes storage variables", () => {
    expect(categorizeIssue(makeIssue("S3_BUCKET"))).toBe("storage");
    expect(categorizeIssue(makeIssue("UPLOAD_DIR"))).toBe("storage");
  });

  it("categorizes observability variables", () => {
    expect(categorizeIssue(makeIssue("SENTRY_DSN"))).toBe("observability");
    expect(categorizeIssue(makeIssue("LOG_LEVEL"))).toBe("observability");
  });

  it("falls back to other", () => {
    expect(categorizeIssue(makeIssue("APP_NAME"))).toBe("other");
    expect(categorizeIssue(makeIssue("FEATURE_FLAG"))).toBe("other");
  });
});

describe("groupByCategory", () => {
  it("groups issues into correct categories", () => {
    const issues = [makeIssue("JWT_SECRET"), makeIssue("DATABASE_URL"), makeIssue("APP_NAME")];
    const grouped = groupByCategory(issues);
    expect(grouped.get("auth")).toHaveLength(1);
    expect(grouped.get("database")).toHaveLength(1);
    expect(grouped.get("other")).toHaveLength(1);
  });
});

describe("formatCategory", () => {
  it("returns no-issues message for empty report", () => {
    const report = makeReport([]);
    expect(formatCategory(report)).toBe("No issues found.\n");
  });

  it("includes category headers and issue details", () => {
    const issues = [makeIssue("JWT_SECRET"), makeIssue("DATABASE_URL")];
    const output = formatCategory(makeReport(issues));
    expect(output).toContain("[AUTH]");
    expect(output).toContain("[DATABASE]");
    expect(output).toContain("JWT_SECRET");
    expect(output).toContain("DATABASE_URL");
  });

  it("includes total summary line", () => {
    const issues = [makeIssue("JWT_SECRET"), makeIssue("APP_NAME")];
    const output = formatCategory(makeReport(issues));
    expect(output).toContain("Total: 2 issues");
  });

  it("shows singular forms correctly", () => {
    const output = formatCategory(makeReport([makeIssue("JWT_SECRET")]));
    expect(output).toContain("1 issue");
    expect(output).not.toContain("1 issues");
  });
});
