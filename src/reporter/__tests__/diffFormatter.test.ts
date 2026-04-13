import { formatDiff } from "../diffFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      totalIssues: issues.length,
      missing: issues.filter(i => i.type === "missing").length,
      duplicates: issues.filter(i => i.type === "duplicate").length,
      undocumented: issues.filter(i => i.type === "undocumented").length,
    },
  };
}

describe("formatDiff", () => {
  it("shows a clean message when there are no issues", () => {
    const output = formatDiff(makeReport([]));
    expect(output).toContain("no issues found");
  });

  it("prefixes missing variables with '-'", () => {
    const report = makeReport([
      { type: "missing", variable: "DB_HOST", severity: "error", message: "missing", locations: [] },
    ]);
    const output = formatDiff(report);
    expect(output).toMatch(/^- DB_HOST/m);
    expect(output).toContain("missing from .env file");
  });

  it("prefixes undocumented variables with '+'", () => {
    const report = makeReport([
      { type: "undocumented", variable: "SECRET_KEY", severity: "warning", message: "undocumented", locations: [] },
    ]);
    const output = formatDiff(report);
    expect(output).toMatch(/^\+ SECRET_KEY/m);
    expect(output).toContain("used in source but not declared");
  });

  it("prefixes duplicate variables with '~'", () => {
    const report = makeReport([
      {
        type: "duplicate",
        variable: "API_KEY",
        severity: "warning",
        message: "duplicate",
        locations: [{ file: ".env", line: 1 }, { file: ".env.local", line: 2 }],
      },
    ]);
    const output = formatDiff(report);
    expect(output).toMatch(/^~ API_KEY/m);
    expect(output).toContain(".env");
    expect(output).toContain(".env.local");
  });

  it("includes a summary hunk header at the end", () => {
    const report = makeReport([
      { type: "missing", variable: "PORT", severity: "error", message: "missing", locations: [] },
    ]);
    const output =n    expect(output).toContain("@@ 1 issue(s)");
    expect(output).toContain("1 missing");
  });

  it("includes diff file headers", () => {
    const output = formatDiff(makeReport([]));
    expect(output).toContain("--- .env (declared)");
    expect(output).toContain("+++ source (used)");
  });
});
