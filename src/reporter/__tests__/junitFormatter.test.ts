import { formatJunit } from "../junitFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    summary: {
      total: issues.length,
      missing: issues.filter((i) => i.type === "missing").length,
      duplicate: issues.filter((i) => i.type === "duplicate").length,
      undocumented: issues.filter((i) => i.type === "undocumented").length,
    },
    issues,
  };
}

describe("formatJunit", () => {
  it("produces valid XML declaration and root element", () => {
    const report = makeReport([]);
    const output = formatJunit(report);
    expect(output).toContain(`<?xml version="1.0" encoding="UTF-8"?>`);
    expect(output).toContain(`<testsuites`);
    expect(output).toContain(`</testsuites>`);
  });

  it("includes testsuite with correct counts", () => {
    const issues: Issue[] = [
      { type: "missing", severity: "error", variable: "DB_URL", message: "Missing DB_URL" },
    ];
    const output = formatJunit(makeReport(issues));
    expect(output).toContain(`tests="1"`);
    expect(output).toContain(`failures="1"`);
  });

  it("renders a testcase with failure for each issue", () => {
    const issues: Issue[] = [
      {
        type: "duplicate",
        severity: "warning",
        variable: "API_KEY",
        message: "Duplicate API_KEY",
        locations: [{ file: ".env", line: 3 }],
      },
    ];
    const output = formatJunit(makeReport(issues));
    expect(output).toContain(`<testcase`);
    expect(output).toContain(`<failure`);
    expect(output).toContain(`API_KEY`);
    expect(output).toContain(`.env:3`);
  });

  it("escapes special characters in variable names", () => {
    const issues: Issue[] = [
      {
        type: "undocumented",
        severity: "info",
        variable: "VAR_<test>",
        message: "Undocumented VAR_<test>",
      },
    ];
    const output = formatJunit(makeReport(issues));
    expect(output).not.toContain("<test>");
    expect(output).toContain("&lt;test&gt;");
  });

  it("handles empty report with zero tests", () => {
    const output = formatJunit(makeReport([]));
    expect(output).toContain(`tests="0"`);
    expect(output).toContain(`failures="0"`);
  });
});
