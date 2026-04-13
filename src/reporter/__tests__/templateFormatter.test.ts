import { formatTemplate } from "../templateFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[] = []): Report {
  return {
    summary: {
      directory: "/project",
      totalIssues: issues.length,
      critical: issues.filter((i) => i.severity === "critical").length,
      warning: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
    },
    issues,
  };
}

const sampleIssue: Issue = {
  type: "missing",
  severity: "critical",
  variable: "DATABASE_URL",
  message: "Variable is used in source but missing from .env",
  locations: [
    { file: "src/db.ts", line: 12 },
    { file: "src/config.ts" },
  ],
};

describe("formatTemplate", () => {
  it("renders the default template with no issues", () => {
    const report = makeReport([]);
    const output = formatTemplate(report);
    expect(output).toContain("ENV AUDIT REPORT");
    expect(output).toContain("No issues found.");
    expect(output).toContain("Total Issues : 0");
    expect(output).toContain("Directory: /project");
  });

  it("renders issues using the default template", () => {
    const report = makeReport([sampleIssue]);
    const output = formatTemplate(report);
    expect(output).toContain("[CRITICAL] DATABASE_URL");
    expect(output).toContain("Variable is used in source but missing from .env");
    expect(output).toContain("src/db.ts:12");
    expect(output).toContain("src/config.ts");
    expect(output).toContain("Total Issues : 1");
    expect(output).toContain("Critical     : 1");
  });

  it("supports a custom template", () => {
    const custom = `Issues: {{totalIssues}} | Dir: {{directory}}\n{{#issues}}* {{variable}}: {{message}}\n{{/issues}}`;
    const report = makeReport([sampleIssue]);
    const output = formatTemplate(report, custom);
    expect(output).toContain("Issues: 1");
    expect(output).toContain("Dir: /project");
    expect(output).toContain("* DATABASE_URL: Variable is used in source but missing from .env");
  });

  it("handles issues with no locations gracefully", () => {
    const issue: Issue = {
      type: "undocumented",
      severity: "info",
      variable: "FEATURE_FLAG",
      message: "Variable is undocumented",
      locations: [],
    };
    const report = makeReport([issue]);
    const output = formatTemplate(report);
    expect(output).toContain("[INFO] FEATURE_FLAG");
    expect(output).toContain("Locations: N/A");
  });

  it("includes scannedAt timestamp in output", () => {
    const report = makeReport([]);
    const output = formatTemplate(report);
    expect(output).toMatch(/Scanned At: \d{4}-\d{2}-\d{2}T/);
  });
});
