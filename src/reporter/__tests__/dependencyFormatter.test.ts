import { formatDependency } from "../dependencyFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("formatDependency", () => {
  it("returns empty message when no issues", () => {
    const output = formatDependency(makeReport([]));
    expect(output).toContain("no issues found");
  });

  it("includes variable name in output", () => {
    const report = makeReport([
      {
        variable: "DATABASE_URL",
        type: "missing",
        severity: "error",
        message: "Missing variable",
        locations: [{ file: "src/db.ts", line: 10 }],
      },
    ]);
    const output = formatDependency(report);
    expect(output).toContain("DATABASE_URL");
    expect(output).toContain("src/db.ts");
    expect(output).toContain("missing");
    expect(output).toContain("error");
  });

  it("deduplicates files in referencedBy", () => {
    const report = makeReport([
      {
        variable: "API_KEY",
        type: "duplicate",
        severity: "warning",
        message: "Duplicate variable",
        locations: [
          { file: "src/a.ts", line: 1 },
          { file: "src/a.ts", line: 2 },
          { file: "src/b.ts", line: 5 },
        ],
      },
    ]);
    const output = formatDependency(report);
    const matches = output.match(/src\/a\.ts/g) || [];
    expect(matches.length).toBe(1);
    expect(output).toContain("src/b.ts");
  });

  it("shows (none) when no locations", () => {
    const report = makeReport([
      {
        variable: "SECRET",
        type: "undocumented",
        severity: "info",
        message: "Undocumented",
        locations: [],
      },
    ]);
    const output = formatDependency(report);
    expect(output).toContain("(none)");
  });

  it("includes total variable count", () => {
    const report = makeReport([
      { variable: "A", type: "missing", severity: "error", message: "m", locations: [] },
      { variable: "B", type: "missing", severity: "error", message: "m", locations: [] },
    ]);
    const output = formatDependency(report);
    expect(output).toContain("Total variables: 2");
  });
});
