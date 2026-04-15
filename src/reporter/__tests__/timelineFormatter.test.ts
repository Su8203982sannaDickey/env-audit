import { formatTimeline } from "../timelineFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Partial<Issue>[] = []): Report {
  const full: Issue[] = issues.map((i) => ({
    severity: "error",
    type: "missing",
    variable: "VAR",
    message: "Missing variable",
    locations: [],
    ...i,
  }));
  return {
    issues: full,
    summary: {
      errorCount: full.filter((i) => i.severity === "error").length,
      warnCount: full.filter((i) => i.severity === "warn").length,
      infoCount: full.filter((i) => i.severity === "info").length,
      totalFiles: 1,
      scannedAt: new Date(0).toISOString(),
    },
  };
}

describe("formatTimeline", () => {
  it("includes header and summary", () => {
    const output = formatTimeline(makeReport());
    expect(output).toContain("# Env Audit — Issue Timeline");
    expect(output).toContain("# Total issues: 0");
    expect(output).toContain("(no issues found)");
  });

  it("renders a single issue row", () => {
    const report = makeReport([{ variable: "DB_HOST", severity: "error", type: "missing" }]);
    const output = formatTimeline(report);
    expect(output).toContain("DB_HOST");
    expect(output).toContain("ERROR");
    expect(output).toContain("missing");
    expect(output).toContain("[001]");
  });

  it("renders multiple issues with sequential indices", () => {
    const report = makeReport([
      { variable: "DB_HOST" },
      { variable: "API_KEY", severity: "warn" },
    ]);
    const output = formatTimeline(report);
    expect(output).toContain("[001]");
    expect(output).toContain("[002]");
    expect(output).toContain("DB_HOST");
    expect(output).toContain("API_KEY");
  });

  it("includes file locations when present", () => {
    const report = makeReport([
      {
        variable: "SECRET",
        locations: [{ file: "src/app.ts", line: 10 }],
      },
    ]);
    const output = formatTimeline(report);
    expect(output).toContain("src/app.ts:10");
  });

  it("shows n/a when no locations", () => {
    const report = makeReport([{ variable: "MISSING_VAR", locations: [] }]);
    const output = formatTimeline(report);
    expect(output).toContain("n/a");
  });

  it("includes summary line at end", () => {
    const report = makeReport([
      { severity: "error" },
      { severity: "warn" },
      { severity: "info" },
    ]);
    const output = formatTimeline(report);
    expect(output).toContain("# Summary:");
    expect(output).toContain("error(s)");
    expect(output).toContain("warning(s)");
  });
});
