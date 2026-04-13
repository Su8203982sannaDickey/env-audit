import { formatGithubActions } from "../githubActionsFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      totalIssues: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("formatGithubActions", () => {
  it("wraps output in a group annotation", () => {
    const report = makeReport([]);
    const output = formatGithubActions(report);
    expect(output).toContain("::group::env-audit results");
    expect(output).toContain("::endgroup::");
  });

  it("emits error annotation for error severity", () => {
    const report = makeReport([
      {
        rule: "missing-var",
        severity: "error",
        message: "DB_URL is missing",
        variable: "DB_URL",
        locations: [{ file: "src/db.ts", line: 10 }],
      },
    ]);
    const output = formatGithubActions(report);
    expect(output).toContain("::error file=src/db.ts,line=10");
    expect(output).toContain("DB_URL is missing");
  });

  it("emits warning annotation for warning severity", () => {
    const report = makeReport([
      {
        rule: "undocumented-var",
        severity: "warning",
        message: "SECRET_KEY is undocumented",
        variable: "SECRET_KEY",
        locations: [],
      },
    ]);
    const output = formatGithubActions(report);
    expect(output).toContain("::warning title=undocumented-var::SECRET_KEY is undocumented");
  });

  it("emits notice annotation for info severity", () => {
    const report = makeReport([
      {
        rule: "duplicate-var",
        severity: "info",
        message: "PORT is duplicated",
        variable: "PORT",
        locations: [{ file: ".env", line: 3 }, { file: ".env.local", line: 1 }],
      },
    ]);
    const output = formatGithubActions(report);
    expect(output).toContain("::notice file=.env,line=3");
    expect(output).toContain("::notice file=.env.local,line=1");
  });

  it("includes total issue count in group header", () => {
    const report = makeReport([
      { rule: "r", severity: "error", message: "m", variable: "V", locations: [] },
      { rule: "r", severity: "warning", message: "m2", variable: "V2", locations: [] },
    ]);
    const output = formatGithubActions(report);
    expect(output).toContain("2 issues");
  });
});
