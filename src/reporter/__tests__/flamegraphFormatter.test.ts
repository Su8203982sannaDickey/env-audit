import { formatFlamegraph } from "../flamegraphFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warn").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("formatFlamegraph", () => {
  it("returns valid JSON", () => {
    const report = makeReport([]);
    const output = formatFlamegraph(report);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it("root node is named env-audit", () => {
    const report = makeReport([]);
    const root = JSON.parse(formatFlamegraph(report));
    expect(root.name).toBe("env-audit");
  });

  it("groups issues by file", () => {
    const issues: Issue[] = [
      { variable: "API_KEY", type: "missing", severity: "error", locations: [{ file: "src/app.ts", line: 10 }], message: "missing" },
      { variable: "DB_URL", type: "undocumented", severity: "warn", locations: [{ file: "src/db.ts", line: 5 }], message: "undocumented" },
    ];
    const root = JSON.parse(formatFlamegraph(makeReport(issues)));
    const fileNames = root.children.map((c: { name: string }) => c.name);
    expect(fileNames).toContain("src/app.ts");
    expect(fileNames).toContain("src/db.ts");
  });

  it("accumulates severity weights in parent value", () => {
    const issues: Issue[] = [
      { variable: "API_KEY", type: "missing", severity: "error", locations: [{ file: "src/app.ts", line: 1 }], message: "m" },
      { variable: "SECRET", type: "duplicate", severity: "warn", locations: [{ file: "src/app.ts", line: 2 }], message: "d" },
    ];
    const root = JSON.parse(formatFlamegraph(makeReport(issues)));
    const fileNode = root.children.find((c: { name: string }) => c.name === "src/app.ts");
    expect(fileNode.value).toBe(5); // error=3 + warn=2
  });

  it("falls back to <unknown> when no locations", () => {
    const issues: Issue[] = [
      { variable: "ORPHAN", type: "missing", severity: "info", locations: [], message: "no loc" },
    ];
    const root = JSON.parse(formatFlamegraph(makeReport(issues)));
    const fileNode = root.children.find((c: { name: string }) => c.name === "<unknown>");
    expect(fileNode).toBeDefined();
  });

  it("leaf node name contains variable and type", () => {
    const issues: Issue[] = [
      { variable: "TOKEN", type: "missing", severity: "error", locations: [{ file: "src/auth.ts", line: 3 }], message: "missing" },
    ];
    const root = JSON.parse(formatFlamegraph(makeReport(issues)));
    const fileNode = root.children[0];
    expect(fileNode.children[0].name).toContain("TOKEN");
    expect(fileNode.children[0].name).toContain("missing");
  });
});
