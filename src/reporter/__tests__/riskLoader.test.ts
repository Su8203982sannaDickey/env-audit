import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { loadRiskConfig, RiskConfig } from "../riskLoader";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "risk-loader-test-"));
}

describe("loadRiskConfig", () => {
  it("returns defaults when no config file exists", () => {
    const dir = makeTempDir();
    const config = loadRiskConfig(dir);
    expect(config.severityWeights.error).toBe(40);
    expect(config.typeWeights.missing).toBe(30);
    expect(config.locationThreshold).toBe(3);
  });

  it("loads .env-audit-risk.json and merges with defaults", () => {
    const dir = makeTempDir();
    const custom: Partial<RiskConfig> = {
      severityWeights: { error: 50, warning: 25, info: 5 },
    };
    fs.writeFileSync(
      path.join(dir, ".env-audit-risk.json"),
      JSON.stringify(custom)
    );
    const config = loadRiskConfig(dir);
    expect(config.severityWeights.error).toBe(50);
    expect(config.severityWeights.warning).toBe(25);
    expect(config.typeWeights.missing).toBe(30); // default preserved
  });

  it("loads env-audit-risk.json as fallback name", () => {
    const dir = makeTempDir();
    const custom = { locationBonus: 20 };
    fs.writeFileSync(
      path.join(dir, "env-audit-risk.json"),
      JSON.stringify(custom)
    );
    const config = loadRiskConfig(dir);
    expect(config.locationBonus).toBe(20);
  });

  it("prefers .env-audit-risk.json over env-audit-risk.json", () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, ".env-audit-risk.json"),
      JSON.stringify({ locationBonus: 99 })
    );
    fs.writeFileSync(
      path.join(dir, "env-audit-risk.json"),
      JSON.stringify({ locationBonus: 1 })
    );
    const config = loadRiskConfig(dir);
    expect(config.locationBonus).toBe(99);
  });

  it("returns defaults if config file is invalid JSON", () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, ".env-audit-risk.json"), "not json {{{");
    const config = loadRiskConfig(dir);
    expect(config.severityWeights.error).toBe(40);
  });
});
