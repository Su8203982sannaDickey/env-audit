import { formatCheckstyle } from "../checkstyleFormatter";
import { Report, Issue } from "../types";

function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    missing: [],
    duplicates: [],
    undocumented: [],
    summary: { total: 0, errors: 0, warnings: 0, infos: 0 },
    ...overrides,
  };
}

const missingIssue: Issue = {
  type: "missing",
  severity: "error",
  variable: "DB_HOST",
  message: "DB_HOST is missing from .env file",
  locations: [{ file: "src/db.ts", line: 10 }],
};

const duplicateIssue: Issue = {
  type: "duplicate",
  severity: "warning",
  variable: "API_KEY",
  message: "API_KEY is duplicated",
  locations: [
    { file: ".env", line: 3 },
    { file: ".env.local", line: 1 },
  ],
};

describe("formatCheckstyle", () => {
  it("wraps output in checkstyle root element", () => {
    const output = formatCheckstyle(makeReport());
    expect(output).toContain(`<?xml version="1.0" encoding="UTF-8"?>`);
    expect(output).toContain(`<checkstyle version="8.0">`);
    expect(output).toContain(`</checkstyle>`);
  });

  it("emits a file block for each unique file", () => {
    const report = makeReport({ missing: [missingIssue] });
    const output = formatCheckstyle(report);
    expect(output).toContain(`<file name="src/db.ts">`);
  });

  it("emits an error element with correct severity for error issues", () => {
    const report = makeReport({ missing: [missingIssue] });
    const output = formatCheckstyle(report);
    expect(output).toContain(`severity="error"`);
    expect(output).toContain(`source="env-audit.missing"`);
  });

  it("emits warning severity for duplicate issues", () => {
    const report = makeReport({ duplicates: [duplicateIssue] });
    const output = formatCheckstyle(report);
    expect(output).toContain(`severity="warning"`);
    expect(output).toContain(`source="env-audit.duplicate"`);
  });

  it("escapes special characters in messages", () => {
    const issue: Issue = {
      ...missingIssue,
      message: 'Value has <special> & "chars"',
    };
    const output = formatCheckstyle(makeReport({ missing: [issue] }));
    expect(output).toContain("&lt;special&gt;");
    expect(output).toContain("&amp;");
    expect(output).toContain("&quot;chars&quot;");
  });

  it("groups issues from multiple files into separate file blocks", () => {
    const report = makeReport({
      missing: [missingIssue],
      duplicates: [duplicateIssue],
    });
    const output = formatCheckstyle(report);
    expect(output).toContain(`<file name="src/db.ts">`);
    expect(output).toContain(`<file name=".env">`);
    expect(output).toContain(`<file name=".env.local">`);
  });

  it("returns empty checkstyle block for empty report", () => {
    const output = formatCheckstyle(makeReport());
    expect(output).not.toContain("<file");
    expect(output).not.toContain("<error");
  });
});
