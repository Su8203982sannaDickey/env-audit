import { applyIgnoreRules, formatIgnoredList, formatIgnore, IgnoreConfig } from "../ignoreFormatter";
import { Report, Issue } from "../types";

function makeReport(overrides: Partial<Report> = {}): Report {
  const issues: Issue[] = [
    { variable: "SECRET_KEY", type: "missing", severity: "error", message: "Missing SECRET_KEY", locations: [] },
    { variable: "API_URL", type: "undocumented", severity: "warning", message: "Undocumented API_URL", locations: [] },
    { variable: "DEBUG", type: "duplicate", severity: "info", message: "Duplicate DEBUG", locations: [] },
  ];
  return { issues, summary: { total: issues.length, errors: 1, warnings: 1, info: 1 }, ...overrides };
}

describe("applyIgnoreRules", () => {
  it("filters out ignored variables", () => {
    const config: IgnoreConfig = { rules: [{ variable: "SECRET_KEY" }] };
    const result = applyIgnoreRules(makeReport(), config);
    expect(result.issues).toHaveLength(2);
    expect(result.issues.find((i) => i.variable === "SECRET_KEY")).toBeUndefined();
  });

  it("returns all issues when no rules", () => {
    const config: IgnoreConfig = { rules: [] };
    const result = applyIgnoreRules(makeReport(), config);
    expect(result.issues).toHaveLength(3);
  });

  it("handles multiple ignore rules", () => {
    const config: IgnoreConfig = { rules: [{ variable: "SECRET_KEY" }, { variable: "DEBUG" }] };
    const result = applyIgnoreRules(makeReport(), config);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].variable).toBe("API_URL");
  });
});

describe("formatIgnoredList", () => {
  it("shows message when no rules", () => {
    const output = formatIgnoredList({ rules: [] });
    expect(output).toContain("No variables are currently ignored");
  });

  it("lists ignored variables with reasons", () => {
    const config: IgnoreConfig = { rules: [{ variable: "SECRET_KEY", reason: "legacy" }] };
    const output = formatIgnoredList(config);
    expect(output).toContain("SECRET_KEY");
    expect(output).toContain("legacy");
  });
});

describe("formatIgnore", () => {
  it("reports suppressed count", () => {
    const config: IgnoreConfig = { rules: [{ variable: "SECRET_KEY" }] };
    const output = formatIgnore(makeReport(), config);
    expect(output).toContain("Issues suppressed: 1");
    expect(output).toContain("Issues after applying ignore rules: 2");
  });
});
