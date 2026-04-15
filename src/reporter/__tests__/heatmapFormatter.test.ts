import { formatHeatmap } from "../heatmapFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Partial<Issue>[] = []): Report {
  const full: Issue[] = issues.map((i) => ({
    severity: "error",
    type: "missing",
    variable: "VAR",
    message: "Missing",
    locations: [],
    ...i,
  }));
  return {
    issues: full,
    summary: {
      errorCount: full.filter((i) => i.severity === "error").length,
      warnCount: full.filter((i) => i.severity === "warn").length,
      infoCount: full.filter((i) => i.severity === "info").length,
      totalFiles: 1,
      scannedAt: new Date(0).toISOString(),
    },
  };
}

describe("formatHeatmap", () => {
  it("shows header", () => {
    const output = formatHeatmap(makeReport());
    expect(output).toContain("# Env Audit — File Heatmap");
  });

  it("shows no issues message when empty", () => {
    const output = formatHeatmap(makeReport());
    expect(output).toContain("(no issues found)");
    expect(output).toContain("0 file(s) affected");
  });

  it("lists affected files", () => {
    const report = makeReport([
      { locations: [{ file: "src/app.ts", line: 1 }] },
      { locations: [{ file: "src/db.ts", line: 5 }] },
    ]);
    const output = formatHeatmap(report);
    expect(output).toContain("src/app.ts");
    expect(output).toContain("src/db.ts");
    expect(output).toContain("2 file(s) affected");
  });

  it("aggregates counts per file", () => {
    const report = makeReport([
      { severity: "error", locations: [{ file: "src/app.ts", line: 1 }] },
      { severity: "warn", locations: [{ file: "src/app.ts", line: 2 }] },
    ]);
    const output = formatHeatmap(report);
    const lines = output.split("\n").filter((l) => l.includes("src/app.ts"));
    expect(lines.length).toBe(1);
    expect(lines[0]).toContain("2"); // total
  });

  it("sorts files by total descending", () => {
    const report = makeReport([
      { locations: [{ file: "b.ts", line: 1 }] },
      { locations: [{ file: "a.ts", line: 1 }] },
      { locations: [{ file: "a.ts", line: 2 }] },
    ]);
    const output = formatHeatmap(report);
    const aIdx = output.indexOf("a.ts");
    const bIdx = output.indexOf("b.ts");
    expect(aIdx).toBeLessThan(bIdx);
  });

  it("uses (unknown) for issues without locations", () => {
    const report = makeReport([{ locations: [] }]);
    const output = formatHeatmap(report);
    expect(output).toContain("(unknown)");
  });
});
