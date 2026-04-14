import { formatTsv, escapeTsvField, formatLocations, formatIssueRow } from "../tsvFormatter";
import { Report, Issue } from "../types";

function makeReport(issues: Issue[] = []): Report {
  return {
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
    issues,
  };
}

const sampleIssue: Issue = {
  variable: "DATABASE_URL",
  severity: "error",
  type: "missing",
  message: "Variable is used in source but not defined in any .env file.",
  locations: [
    { file: "src/db.ts", line: 12 },
    { file: "src/config.ts", line: 4 },
  ],
};

describe("escapeTsvField", () => {
  it("replaces tab characters with spaces", () => {
    expect(escapeTsvField("hello\tworld")).toBe("hello world");
  });

  it("replaces newlines with spaces", () => {
    expect(escapeTsvField("hello\nworld")).toBe("hello world");
    expect(escapeTsvField("hello\r\nworld")).toBe("hello world");
  });

  it("leaves normal strings unchanged", () => {
    expect(escapeTsvField("DATABASE_URL")).toBe("DATABASE_URL");
  });
});

describe("formatLocations", () => {
  it("returns empty string for no locations", () => {
    expect(formatLocations([])).toBe("");
    expect(formatLocations(undefined as any)).toBe("");
  });

  it("formats locations as file:line separated by semicolons", () => {
    expect(formatLocations(sampleIssue.locations!)).toBe(
      "src/db.ts:12; src/config.ts:4"
    );
  });
});

describe("formatIssueRow", () => {
  it("produces a tab-separated row with correct fields", () => {
    const row = formatIssueRow(sampleIssue);
    const parts = row.split("\t");
    expect(parts).toHaveLength(5);
    expect(parts[0]).toBe("DATABASE_URL");
    expect(parts[1]).toBe("error");
    expect(parts[2]).toBe("missing");
  });
});

describe("formatTsv", () => {
  it("includes a header row as the first line", () => {
    const output = formatTsv(makeReport([sampleIssue]));
    const lines = output.trim().split("\n");
    expect(lines[0]).toBe("variable\tseverity\ttype\tmessage\tlocations");
  });

  it("includes one data row per issue", () => {
    const report = makeReport([sampleIssue, { ...sampleIssue, variable: "SECRET_KEY" }]);
    const lines = formatTsv(report).trim().split("\n");
    expect(lines).toHaveLength(3); // header + 2 issues
  });

  it("produces only a header for an empty report", () => {
    const output = formatTsv(makeReport([]));
    const lines = output.trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/^variable/);
  });

  it("ends with a newline", () => {
    const output = formatTsv(makeReport([sampleIssue]));
    expect(output.endsWith("\n")).toBe(true);
  });
});
