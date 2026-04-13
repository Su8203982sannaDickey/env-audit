import { formatToml } from "../tomlFormatter";
import { Report, Issue } from "../types";

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

describe("formatToml", () => {
  it("outputs a summary block with correct counts", () => {
    const report = makeReport([]);
    const output = formatToml(report);
    expect(output).toContain("[summary]");
    expect(output).toContain("total = 0");
    expect(output).toContain("errors = 0");
    expect(output).toContain("warnings = 0");
    expect(output).toContain("infos = 0");
  });

  it("outputs a comment when there are no issues", () => {
    const report = makeReport([]);
    const output = formatToml(report);
    expect(output).toContain("# No issues found");
  });

  it("outputs [[issues]] blocks for each issue", () => {
    const report = makeReport([
      {
        variable: "API_KEY",
        severity: "error",
        type: "missing",
        message: "KEY is missing from .env",
        locations: [],
      },
    ]);
    const output = formatToml(report);
    expect(output).toContain("[[issues]]");
    expect(output).toContain(`variable = "API_KEY"`);
    expect(output).toContain(`severity = "error"`);
    expect(output).toContain(`type = "missing"`);
    expect(output).toContain(`message = "API_KEY is missing from .env"`);
  });

  it("includes locations when present", () => {
    const report = makeReport([
      {
        variable: "DB_URL",
        severity: "warning",
        type: "undocumented",
        message: "DB_URL is undocumented",
        locations: [{ file: "src/db.ts", line: 12 }],
      },
    ]);
    const output = formatToml(report);
    expect(output).toContain("src/db.ts:12");
  });

  it("escapes special characters in strings", () => {
    const report = makeReport([
      {
        variable: "MY_VAR",
        severity: "info",
        type: "duplicate",
        message: 'Has "quotes" and \\backslash',
        locations: [],
      },
    ]);
    const output = formatToml(report);
    expect(output).toContain(`\\"quotes\\"`);
    expect(output).toContain(`\\\\backslash`);
  });

  it("outputs correct summary counts for mixed issues", () => {
    const report = makeReport([
      { variable: "A", severity: "error", type: "missing", message: "m", locations: [] },
      { variable: "B", severity: "warning", type: "duplicate", message: "m", locations: [] },
      { variable: "C", severity: "info", type: "undocumented", message: "m", locations: [] },
    ]);
    const output = formatToml(report);
    expect(output).toContain("total = 3");
    expect(output).toContain("errors = 1");
    expect(output).toContain("warnings = 1");
    expect(output).toContain("infos = 1");
  });
});
