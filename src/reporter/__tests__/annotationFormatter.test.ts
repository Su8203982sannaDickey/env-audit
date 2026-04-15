import { formatAnnotation } from "../annotationFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Partial<Issue>[] = []): Report {
  const fullIssues: Issue[] = issues.map((i) => ({
    variable: i.variable ?? "TEST_VAR",
    type: i.type ?? "missing",
    severity: i.severity ?? "error",
    message: i.message ?? "Variable is missing",
    locations: i.locations ?? [],
  }));
  return {
    issues: fullIssues,
    summary: {
      total: fullIssues.length,
      missing: fullIssues.filter((i) => i.type === "missing").length,
      duplicate: fullIssues.filter((i) => i.type === "duplicate").length,
      undocumented: fullIssues.filter((i) => i.type === "undocumented").length,
    },
  };
}

describe("formatAnnotation", () => {
  it("returns no-issues message for empty report", () => {
    const output = formatAnnotation(makeReport([]));
    expect(output).toBe("No issues found.\n");
  });

  it("includes annotation header with issue count", () => {
    const output = formatAnnotation(makeReport([{ variable: "API_KEY" }]));
    expect(output).toContain("1 issue(s) found");
  });

  it("maps error severity to FAILURE level", () => {
    const output = formatAnnotation(makeReport([{ severity: "error" }]));
    expect(output).toContain("[FAILURE]");
  });

  it("maps warning severity to WARNING level", () => {
    const output = formatAnnotation(makeReport([{ severity: "warning" }]));
    expect(output).toContain("[WARNING]");
  });

  it("maps info severity to NOTICE level", () => {
    const output = formatAnnotation(makeReport([{ severity: "info" }]));
    expect(output).toContain("[NOTICE]");
  });

  it("includes variable name in output", () => {
    const output = formatAnnotation(makeReport([{ variable: "DATABASE_URL" }]));
    expect(output).toContain("DATABASE_URL");
  });

  it("includes message in output", () => {
    const output = formatAnnotation(
      makeReport([{ message: "Variable is undocumented" }])
    );
    expect(output).toContain("Variable is undocumented");
  });

  it("lists locations when present", () => {
    const output = formatAnnotation(
      makeReport([{ locations: ["src/app.ts:12", "src/config.ts:5"] }])
    );
    expect(output).toContain("src/app.ts:12");
    expect(output).toContain("src/config.ts:5");
  });

  it("handles multiple issues with sequential numbering", () => {
    const output = formatAnnotation(
      makeReport([
        { variable: "VAR_ONE" },
        { variable: "VAR_TWO" },
      ])
    );
    expect(output).toContain("[1]");
    expect(output).toContain("[2]");
    expect(output).toContain("VAR_ONE");
    expect(output).toContain("VAR_TWO");
  });

  it("includes type field in annotation block", () => {
    const output = formatAnnotation(makeReport([{ type: "duplicate" }]));
    expect(output).toContain("type     : duplicate");
  });
});
