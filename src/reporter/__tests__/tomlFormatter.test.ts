import { formatToml } from "../tomlFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[] = []): Report {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const info = issues.filter((i) => i.severity === "info").length;
  return {
    issues,
    summary: { total: issues.length, errors, warnings, info },
  };
}

describe("formatToml", () => {
  it("renders summary block with zero issues", () => {
    const output = formatToml(makeReport([]));
    expect(output).toContain("[summary]");
    expect(output).toContain("total = 0");
    expect(output).toContain("errors = 0");
    expect(output).toContain("# No issues found");
  });

  it("renders a single issue correctly", () => {
    const issue: Issue = {
      variable: "API_KEY",
      severity: "error",
      type: "missing",
      message: "API_KEY is missing from .env",
      locations: [{ file: "src/index.ts", line: 10 }],
    };
    const output = formatToml(makeReport([issue]));
    expect(output).toContain("[[issues]]");
    expect(output).toContain('variable = "API_KEY"');
    expect(output).toContain('severity = "error"');
    expect(output).toContain('type = "missing"');
    expect(output).toContain("src/index.ts");
    expect(output).toContain("line = 10");
    expect(output).toContain("total = 1");
    expect(output).toContain("errors = 1");
  });

  it("escapes special characters in strings", () => {
    const issue: Issue = {
      variable: "DB_PASS",
      severity: "warning",
      type: "undocumented",
      message: 'Contains \"quotes\" and \\backslash',
      locations: [],
    };
    const output = formatToml(makeReport([issue]));
    expect(output).toContain('\\"quotes\\"');
    expect(output).toContain("\\\\\\\\");
  });

  it("renders multiple issues", () => {
    const issues: Issue[] = [
      { variable: "A", severity: "error", type: "missing", message: "missing A", locations: [] },
      { variable: "B", severity: "warning", type: "duplicate", message: "dup B", locations: [{ file: "x.ts", line: 1 }] },
      { variable: "C", severity: "info", type: "undocumented", message: "undoc C", locations: [] },
    ];
    const output = formatToml(makeReport(issues));
    expect(output).toContain("total = 3");
    expect(output).toContain("errors = 1");
    expect(output).toContain("warnings = 1");
    expect(output).toContain("info = 1");
    expect((output.match(/\[\[issues\]\]/g) || []).length).toBe(3);
  });

  it("handles issue with no locations", () => {
    const issue: Issue = {
      variable: "SECRET",
      severity: "info",
      type: "undocumented",
      message: "SECRET is undocumented",
      locations: [],
    };
    const output = formatToml(makeReport([issue]));
    expect(output).toContain("locations = []");
  });
});
