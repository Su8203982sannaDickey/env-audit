import { formatToml, escapeTomlString, formatLocations, formatIssueToml } from "../tomlFormatter";
import { Report, Issue } from "../types";

function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    summary: {
      total: 2,
      missing: 1,
      duplicate: 0,
      undocumented: 1,
      errors: 1,
      warnings: 1,
      info: 0,
    },
    issues: [
      {
        variable: "DB_HOST",
        type: "missing",
        severity: "error",
        message: "DB_HOST is missing from .env",
        locations: [{ file: "src/db.ts", line: 10 }],
      },
      {
        variable: "API_KEY",
        type: "undocumented",
        severity: "warning",
        message: "API_KEY is undocumented",
        locations: [],
      },
    ],
    ...overrides,
  };
}

describe("escapeTomlString", () => {
  it("escapes backslashes and double quotes", () => {
    expect(escapeTomlString('path\\to\"file')).toBe('path\\\\to\\"file');
  });

  it("returns unchanged string when no special chars", () => {
    expect(escapeTomlString("simple")).toBe("simple");
  });
});

describe("formatLocations", () => {
  it("returns empty string when no locations", () => {
    const issue: Issue = { variable: "X", type: "missing", severity: "error", message: "missing", locations: [] };
    expect(formatLocations(issue)).toBe("");
  });

  it("formats locations correctly", () => {
    const issue: Issue = {
      variable: "X",
      type: "missing",
      severity: "error",
      message: "missing",
      locations: [{ file: "src/app.ts", line: 5 }],
    };
    expect(formatLocations(issue)).toBe('"src/app.ts:5"');
  });
});

describe("formatToml", () => {
  it("includes summary block", () => {
    const output = formatToml(makeReport());
    expect(output).toContain("[summary]");
    expect(output).toContain("total = 2");
    expect(output).toContain("missing = 1");
    expect(output).toContain("errors = 1");
  });

  it("includes issue blocks", () => {
    const output = formatToml(makeReport());
    expect(output).toContain("[[issues]]");
    expect(output).toContain('variable = "DB_HOST"');
    expect(output).toContain('type = "missing"');
    expect(output).toContain('severity = "error"');
  });

  it("handles empty issues list", () => {
    const report = makeReport({ issues: [], summary: { total: 0, missing: 0, duplicate: 0, undocumented: 0, errors: 0, warnings: 0, info: 0 } });
    const output = formatToml(report);
    expect(output).toContain("[summary]");
    expect(output).not.toContain("[[issues]]");
  });

  it("ends with a newline", () => {
    const output = formatToml(makeReport());
    expect(output.endsWith("\n")).toBe(true);
  });
});
