import { formatDotenv } from "../dotenvFormatter";
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

describe("formatDotenv", () => {
  it("outputs header with summary counts", () => {
    const output = formatDotenv(makeReport([]));
    expect(output).toContain("# env-audit report");
    expect(output).toContain("total=0");
    expect(output).toContain("missing=0");
  });

  it("outputs no issues message when report is empty", () => {
    const output = formatDotenv(makeReport([]));
    expect(output).toContain("# No issues found.");
  });

  it("formats a missing issue as a commented .env entry", () => {
    const issues: Issue[] = [
      { type: "missing", severity: "error", variable: "DB_HOST", message: "Missing DB_HOST" },
    ];
    const output = formatDotenv(makeReport(issues));
    expect(output).toContain("# [ERROR] type=missing");
    expect(output).toContain("# Missing DB_HOST");
    expect(output).toContain("DB_HOST=");
  });

  it("includes location comments when present", () => {
    const issues: Issue[] = [
      {
        type: "undocumented",
        severity: "info",
        variable: "SECRET_KEY",
        message: "Undocumented SECRET_KEY",
        locations: [{ file: "src/app.ts", line: 12 }],
      },
    ];
    const output = formatDotenv(makeReport(issues));
    expect(output).toContain("# locations: src/app.ts:12");
    expect(output).toContain("SECRET_KEY=");
  });

  it("uses correct severity badge for warning", () => {
    const issues: Issue[] = [
      { type: "duplicate", severity: "warning", variable: "PORT", message: "Duplicate PORT" },
    ];
    const output = formatDotenv(makeReport(issues));
    expect(output).toContain("# [WARNING]");
  });
});
