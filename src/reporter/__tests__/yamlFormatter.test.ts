import { formatYaml } from "../yamlFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[]): Report {
  return {
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
    },
    issues,
  };
}

describe("formatYaml", () => {
  it("renders an empty issues list correctly", () => {
    const report = makeReport([]);
    const output = formatYaml(report);
    expect(output).toContain("summary:");
    expect(output).toContain("total: 0");
    expect(output).toContain("issues: []");
  });

  it("renders summary counts correctly", () => {
    const issues: Issue[] = [
      {
        type: "missing",
        severity: "error",
        variable: "DB_URL",
        message: "DB_URL is missing from .env",
        locations: [],
      },
      {
        type: "undocumented",
        severity: "warning",
        variable: "SECRET",
        message: "SECRET is undocumented",
        locations: [],
      },
    ];
    const report = makeReport(issues);
    const output = formatYaml(report);
    expect(output).toContain("errors: 1");
    expect(output).toContain("warnings: 1");
    expect(output).toContain("info: 0");
  });

  it("renders issue fields correctly", () => {
    const issues: Issue[] = [
      {
        type: "duplicate",
        severity: "warning",
        variable: "PORT",
        message: "PORT is duplicated",
        locations: [{ file: ".env", line: 3 }, { file: ".env.local", line: 1 }],
      },
    ];
    const report = makeReport(issues);
    const output = formatYaml(report);
    expect(output).toContain("variable: PORT");
    expect(output).toContain("type: duplicate");
    expect(output).toContain(".env:3");
    expect(output).toContain(".env.local:1");
  });

  it("escapes special yaml characters in message", () => {
    const issues: Issue[] = [
      {
        type: "missing",
        severity: "error",
        variable: "API_KEY",
        message: "API_KEY: missing from config",
        locations: [],
      },
    ];
    const report = makeReport(issues);
    const output = formatYaml(report);
    expect(output).toContain('"API_KEY: missing from config"');
  });

  it("outputs valid yaml structure ending with newline", () => {
    const report = makeReport([]);
    const output = formatYaml(report);
    expect(output.endsWith("\n")).toBe(true);
  });
});
