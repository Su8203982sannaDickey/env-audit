import { formatGlean } from "../gleanFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[] = []): Report {
  return {
    summary: {
      totalIssues: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
    issues,
  };
}

describe("formatGlean", () => {
  it("returns a single summary line when there are no issues", () => {
    const output = formatGlean(makeReport([]));
    const parsed = JSON.parse(output);
    expect(parsed.summary).toBe("no issues found");
    expect(parsed.total).toBe(0);
  });

  it("outputs one NDJSON line per issue plus a summary line", () => {
    const issues: Issue[] = [
      {
        variable: "API_KEY",
        type: "missing",
        severity: "error",
        message: "API_KEY is missing from .env",
        locations: [{ file: ".env.example", line: 3 }],
      },
    ];
    const output = formatGlean(makeReport(issues));
    const lines = output.split("\n");
    expect(lines.length).toBe(2);

    const record = JSON.parse(lines[0]);
    expect(record.variable).toBe("API_KEY");
    expect(record.severity).toBe("ERROR");
    expect(record.type).toBe("missing");
    expect(record.locations).toHaveLength(1);
    expect(record.locations[0].file).toBe(".env.example");
    expect(record.locations[0].line).toBe(3);
  });

  it("maps warning severity to WARNING", () => {
    const issues: Issue[] = [
      {
        variable: "DB_HOST",
        type: "duplicate",
        severity: "warning",
        message: "DB_HOST is duplicated",
        locations: [],
      },
    ];
    const output = formatGlean(makeReport(issues));
    const record = JSON.parse(output.split("\n")[0]);
    expect(record.severity).toBe("WARNING");
  });

  it("maps info severity to INFO", () => {
    const issues: Issue[] = [
      {
        variable: "LOG_LEVEL",
        type: "undocumented",
        severity: "info",
        message: "LOG_LEVEL is undocumented",
        locations: [{ file: "src/app.ts", line: 10 }],
      },
    ];
    const output = formatGlean(makeReport(issues));
    const record = JSON.parse(output.split("\n")[0]);
    expect(record.severity).toBe("INFO");
  });

  it("includes a summary record as the last line", () => {
    const issues: Issue[] = [
      {
        variable: "SECRET",
        type: "missing",
        severity: "error",
        message: "SECRET is missing",
        locations: [],
      },
    ];
    const output = formatGlean(makeReport(issues));
    const lines = output.split("\n");
    const summary = JSON.parse(lines[lines.length - 1]);
    expect(summary.total).toBe(1);
    expect(summary).toHaveProperty("timestamp");
  });
});
