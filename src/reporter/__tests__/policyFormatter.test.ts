import { formatPolicy, PolicyConfig } from "../policyFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Partial<Issue>[] = []): Report {
  return {
    issues: issues.map((i) => ({
      variable: "VAR",
      type: "missing",
      severity: "error",
      message: "Missing variable",
      locations: [],
      ...i,
    })) as Issue[],
    summary: {
      total: issues.length,
      errors: 0,
      warnings: 0,
      info: 0,
    },
  };
}

describe("formatPolicy", () => {
  it("returns no-policy message when policy is undefined", () => {
    const report = makeReport();
    const output = formatPolicy(report, undefined);
    expect(output).toContain("No policy rules configured.");
  });

  it("returns no-policy message when rules are empty", () => {
    const report = makeReport();
    const output = formatPolicy(report, { rules: [] });
    expect(output).toContain("No policy rules configured.");
  });

  it("reports all-passed when no violations", () => {
    const report = makeReport([{ variable: "DB_HOST", type: "undocumented", severity: "warning" }]);
    const policy: PolicyConfig = {
      rules: [{ variable: "DB_HOST", required: false, allowedSeverities: ["warning", "error"] }],
    };
    const output = formatPolicy(report, policy);
    expect(output).toContain("✅ All policy rules passed.");
  });

  it("detects required variable missing", () => {
    const report = makeReport([{ variable: "API_KEY", type: "missing", severity: "error" }]);
    const policy: PolicyConfig = {
      rules: [{ variable: "API_KEY", required: true }],
    };
    const output = formatPolicy(report, policy);
    expect(output).toContain("POLICY VIOLATION");
    expect(output).toContain('"API_KEY" is required but missing');
  });

  it("detects disallowed severity", () => {
    const report = makeReport([{ variable: "SECRET", type: "duplicate", severity: "error" }]);
    const policy: PolicyConfig = {
      rules: [{ variable: "SECRET", required: false, allowedSeverities: ["info"] }],
    };
    const output = formatPolicy(report, policy);
    expect(output).toContain('disallowed severity "error"');
  });

  it("includes summary line", () => {
    const report = makeReport([{ variable: "FOO", type: "missing", severity: "error" }]);
    const policy: PolicyConfig = {
      rules: [{ variable: "FOO", required: true }],
    };
    const output = formatPolicy(report, policy);
    expect(output).toMatch(/Summary:.*1 total issue/);
  });
});
