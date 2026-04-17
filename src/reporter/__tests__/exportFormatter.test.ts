import {
  buildManifestEntry,
  formatExport,
  formatExportSummary,
  ExportManifestEntry,
} from "../exportFormatter";
import { Report } from "../types";

function makeReport(issueCount = 2): Report {
  const issues = Array.from({ length: issueCount }, (_, i) => ({
    type: "missing" as const,
    severity: "error" as const,
    variable: `VAR_${i}`,
    message: `Missing VAR_${i}`,
    locations: [],
  }));
  return {
    issues,
    summary: {
      total: issueCount,
      errors: issueCount,
      warnings: 0,
      infos: 0,
      missing: issueCount,
      duplicates: 0,
      undocumented: 0,
    },
  };
}

describe("buildManifestEntry", () => {
  it("returns entry with correct format and size", () => {
    const entry = buildManifestEntry("json", "/out/report.json", '{"a":1}');
    expect(entry.format).toBe("json");
    expect(entry.path).toBe("/out/report.json");
    expect(entry.size).toBeGreaterThan(0);
    expect(entry.generatedAt).toBeTruthy();
  });
});

describe("formatExport", () => {
  it("produces valid JSON manifest", () => {
    const report = makeReport(3);
    const entries: ExportManifestEntry[] = [
      buildManifestEntry("html", "/out/report.html", "<html/>"),
      buildManifestEntry("csv", "/out/report.csv", "a,b,c"),
    ];
    const output = formatExport(report, "/my/project", entries);
    const parsed = JSON.parse(output);
    expect(parsed.projectDir).toBe("/my/project");
    expect(parsed.totalIssues).toBe(3);
    expect(parsed.exports).toHaveLength(2);
    expect(parsed.exports[0].format).toBe("html");
  });
});

describe("formatExportSummary", () => {
  it("renders human-readable summary", () => {
    const report = makeReport(1);
    const entries: ExportManifestEntry[] = [
      buildManifestEntry("markdown", "/out/report.md", "# Report"),
    ];
    const manifest = JSON.parse(formatExport(report, "/proj", entries));
    const summary = formatExportSummary(manifest);
    expect(summary).toContain("Export Manifest");
    expect(summary).toContain("/proj");
    expect(summary).toContain("MARKDOWN");
    expect(summary).toContain("/out/report.md");
  });

  it("shows correct issue count", () => {
    const report = makeReport(5);
    const manifest = JSON.parse(formatExport(report, "/x", []));
    const summary = formatExportSummary(manifest);
    expect(summary).toContain("Total Issues: 5");
  });
});
