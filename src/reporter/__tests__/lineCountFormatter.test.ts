import { formatLineCount } from "../lineCountFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      total: issues.length,
      missing: issues.filter((i) => i.type === "missing").length,
      duplicate: issues.filter((i) => i.type === "duplicate").length,
      undocumented: issues.filter((i) => i.type === "undocumented").length,
    },
  };
}

describe("formatLineCount", () => {
  it("returns a no-issues message when report is empty", () => {
    const result = formatLineCount(makeReport([]));
    expect(result).toContain("No issues found");
  });

  it("groups issues by file and counts them", () => {
    const report = makeReport([
      {
        type: "missing",
        severity: "high",
        variable: "DB_URL",
        message: "Missing DB_URL",
        locations: [{ file: "src/db.ts", line: 10 }],
      },
      {
        type: "undocumented",
        severity: "low",
        variable: "APP_PORT",
        message: "Undocumented APP_PORT",
        locations: [{ file: "src/db.ts", line: 22 }],
      },
      {
        type: "duplicate",
        severity: "medium",
        variable: "SECRET",
        message: "Duplicate SECRET",
        locations: [{ file: "src/auth.ts", line: 5 }],
      },
    ]);

    const result = formatLineCount(report);
    expect(result).toContain("src/db.ts");
    expect(result).toContain("src/auth.ts");
    expect(result).toContain("H:1");
    expect(result).toContain("L:1");
    expect(result).toContain("M:1");
    expect(result).toContain("Total: 3 issue(s) across 2 file(s)");
  });

  it("handles issues with no locations", () => {
    const report = makeReport([
      {
        type: "missing",
        severity: "high",
        variable: "API_KEY",
        message: "Missing API_KEY",
        locations: [],
      },
    ]);

    const result = formatLineCount(report);
    expect(result).toContain("(no location)");
    expect(result).toContain("Total: 1 issue(s) across 1 file(s)");
  });

  it("sorts files by issue count descending", () => {
    const report = makeReport([
      {
        type: "missing",
        severity: "high",
        variable: "A",
        message: "m",
        locations: [{ file: "one.ts", line: 1 }],
      },
      {
        type: "missing",
        severity: "high",
        variable: "B",
        message: "m",
        locations: [{ file: "many.ts", line: 1 }],
      },
      {
        type: "missing",
        severity: "medium",
        variable: "C",
        message: "m",
        locations: [{ file: "many.ts", line: 2 }],
      },
    ]);

    const result = formatLineCount(report);
    const manyIdx = result.indexOf("many.ts");
    const oneIdx = result.indexOf("one.ts");
    expect(manyIdx).toBeLessThan(oneIdx);
  });
});
