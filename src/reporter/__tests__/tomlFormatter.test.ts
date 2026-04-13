import { formatToml } from "../tomlFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[] = []): Report {
  return {
    summary: {
      total: issues.length,
      missing: issues.filter((i) => i.type === "missing").length,
      duplicate: issues.filter((i) => i.type === "duplicate").length,
      undocumented: issues.filter((i) => i.type === "undocumented").length,
      scannedFiles: 3,
      envFiles: 1,
    },
    issues,
  };
}

describe("formatToml", () => {
  it("renders summary block", () => {
    const output = formatToml(makeReport());
    expect(output).toContain("[summary]");
    expect(output).toContain("total = 0");
    expect(output).toContain("scannedFiles = 3");
    expect(output).toContain("envFiles = 1");
  });

  it("renders a missing issue", () => {
    const issue: Issue = {
      variable: "DB_HOST",
      type: "missing",
      severity: "error",
      message: "DB_HOST is missing from .env",
      locations: [{ file: "src/db.ts", line: 10 }],
    };
    const output = formatToml(makeReport([issue]));
    expect(output).toContain("[[issues]]");
    expect(output).toContain('variable = "DB_HOST"');
    expect(output).toContain('type = "missing"');
    expect(output).toContain('severity = "error"');
    expect(output).toContain("[[issues.locations]]");
    expect(output).toContain('file = "src/db.ts"');
    expect(output).toContain("line = 10");
  });

  it("escapes special characters in strings", () => {
    const issue: Issue = {
      variable: "API_KEY",
      type: "undocumented",
      severity: "warning",
      message: 'Contains "quotes" and \nnewlines',
      locations: [],
    };
    const output = formatToml(makeReport([issue]));
    expect(output).toContain('\\"quotes\\"');
    expect(output).toContain("\\n");
  });

  it("renders multiple issues", () => {
    const issues: Issue[] = [
      { variable: "FOO", type: "missing", severity: "error", message: "FOO missing", locations: [] },
      { variable: "BAR", type: "duplicate", severity: "warning", message: "BAR duplicate", locations: [] },
    ];
    const output = formatToml(makeReport(issues));
    expect(output).toContain('variable = "FOO"');
    expect(output).toContain('variable = "BAR"');
    expect((output.match(/\[\[issues\]\]/g) || []).length).toBe(2);
  });

  it("omits locations block when empty", () => {
    const issue: Issue = {
      variable: "SECRET",
      type: "undocumented",
      severity: "info",
      message: "SECRET undocumented",
      locations: [],
    };
    const output = formatToml(makeReport([issue]));
    expect(output).not.toContain("[[issues.locations]]");
  });

  it("ends with a newline", () => {
    const output = formatToml(makeReport());
    expect(output.endsWith("\n")).toBe(true);
  });
});
