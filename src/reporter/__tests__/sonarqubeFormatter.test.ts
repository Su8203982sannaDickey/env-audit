import { formatSonarqube } from "../sonarqubeFormatter";
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

describe("formatSonarqube", () => {
  it("produces valid JSON with an issues array", () => {
    const report = makeReport([]);
    const output = formatSonarqube(report);
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty("issues");
    expect(Array.isArray(parsed.issues)).toBe(true);
  });

  it("maps error severity to CRITICAL", () => {
    const report = makeReport([
      {
        type: "missing",
        severity: "error",
        variable: "DB_URL",
        message: "DB_URL is missing from .env",
        locations: [{ file: ".env", line: 1 }],
      },
    ]);
    const parsed = JSON.parse(formatSonarqube(report));
    expect(parsed.issues[0].severity).toBe("CRITICAL");
    expect(parsed.issues[0].type).toBe("BUG");
  });

  it("maps warning severity to MAJOR", () => {
    const report = makeReport([
      {
        type: "duplicate",
        severity: "warning",
        variable: "API_KEY",
        message: "API_KEY is duplicated",
        locations: [{ file: ".env", line: 3 }],
      },
    ]);
    const parsed = JSON.parse(formatSonarqube(report));
    expect(parsed.issues[0].severity).toBe("MAJOR");
    expect(parsed.issues[0].type).toBe("CODE_SMELL");
  });

  it("maps info severity to MINOR", () => {
    const report = makeReport([
      {
        type: "undocumented",
        severity: "info",
        variable: "LOG_LEVEL",
        message: "LOG_LEVEL is undocumented",
        locations: [{ file: "src/app.ts", line: 10 }],
      },
    ]);
    const parsed = JSON.parse(formatSonarqube(report));
    expect(parsed.issues[0].severity).toBe("MINOR");
  });

  it("includes secondary locations when multiple locations exist", () => {
    const report = makeReport([
      {
        type: "duplicate",
        severity: "warning",
        variable: "SECRET",
        message: "SECRET is duplicated",
        locations: [
          { file: ".env", line: 2 },
          { file: ".env.local", line: 5 },
        ],
      },
    ]);
    const parsed = JSON.parse(formatSonarqube(report));
    expect(parsed.issues[0].secondaryLocations).toHaveLength(1);
    expect(parsed.issues[0].secondaryLocations[0].filePath).toBe(".env.local");
  });

  it("sets engineId to env-audit", () => {
    const report = makeReport([
      {
        type: "missing",
        severity: "error",
        variable: "PORT",
        message: "PORT is missing",
        locations: [{ file: ".env", line: 1 }],
      },
    ]);
    const parsed = JSON.parse(formatSonarqube(report));
    expect(parsed.issues[0].engineId).toBe("env-audit");
  });
});
