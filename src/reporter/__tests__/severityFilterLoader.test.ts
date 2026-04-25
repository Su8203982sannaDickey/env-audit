import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { loadSeverityFilterConfig } from "../severityFilterLoader";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "env-audit-sev-"));
}

describe("loadSeverityFilterConfig", () => {
  it("returns empty options when no config file exists", () => {
    const dir = makeTempDir();
    const result = loadSeverityFilterConfig(dir);
    expect(result).toEqual({});
  });

  it("loads minSeverity from .env-audit-severity.json", () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, ".env-audit-severity.json"),
      JSON.stringify({ minSeverity: "warning" })
    );
    const result = loadSeverityFilterConfig(dir);
    expect(result.minSeverity).toBe("warning");
  });

  it("loads only list from config", () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, "env-audit.severity.json"),
      JSON.stringify({ only: ["error", "warning"] })
    );
    const result = loadSeverityFilterConfig(dir);
    expect(result.only).toEqual(["error", "warning"]);
  });

  it("loads exclude list from config", () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, ".env-audit-severity.json"),
      JSON.stringify({ exclude: ["info"] })
    );
    const result = loadSeverityFilterConfig(dir);
    expect(result.exclude).toEqual(["info"]);
  });

  it("ignores unknown severity values in lists", () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, ".env-audit-severity.json"),
      JSON.stringify({ only: ["error", "critical", "debug"] })
    );
    const result = loadSeverityFilterConfig(dir);
    expect(result.only).toEqual(["error"]);
  });

  it("returns empty options for malformed JSON", () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, ".env-audit-severity.json"),
      "not json {"
    );
    const result = loadSeverityFilterConfig(dir);
    expect(result).toEqual({});
  });
});
