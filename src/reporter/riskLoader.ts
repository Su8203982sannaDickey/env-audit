import * as fs from "fs";
import * as path from "path";

export interface RiskConfig {
  severityWeights: {
    error: number;
    warning: number;
    info: number;
  };
  typeWeights: {
    missing: number;
    duplicate: number;
    undocumented: number;
  };
  locationThreshold: number;
  locationBonus: number;
}

const DEFAULT_CONFIG: RiskConfig = {
  severityWeights: { error: 40, warning: 20, info: 5 },
  typeWeights: { missing: 30, duplicate: 20, undocumented: 10 },
  locationThreshold: 3,
  locationBonus: 10,
};

function mergeConfig(partial: Partial<RiskConfig>): RiskConfig {
  return {
    severityWeights: {
      ...DEFAULT_CONFIG.severityWeights,
      ...(partial.severityWeights ?? {}),
    },
    typeWeights: {
      ...DEFAULT_CONFIG.typeWeights,
      ...(partial.typeWeights ?? {}),
    },
    locationThreshold:
      partial.locationThreshold ?? DEFAULT_CONFIG.locationThreshold,
    locationBonus: partial.locationBonus ?? DEFAULT_CONFIG.locationBonus,
  };
}

export function loadRiskConfig(dir: string): RiskConfig {
  const candidates = [".env-audit-risk.json", "env-audit-risk.json"];
  for (const candidate of candidates) {
    const filePath = path.join(dir, candidate);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        const partial = JSON.parse(raw) as Partial<RiskConfig>;
        return mergeConfig(partial);
      } catch {
        // fall through to default
      }
    }
  }
  return DEFAULT_CONFIG;
}
