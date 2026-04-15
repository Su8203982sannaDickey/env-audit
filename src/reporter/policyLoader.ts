import * as fs from "fs";
import * as path from "path";
import { PolicyConfig, PolicyRule } from "./policyFormatter";

const DEFAULT_POLICY_FILES = [
  ".env-audit-policy.json",
  "env-audit-policy.json",
  ".env-policy.json",
];

function parseRules(raw: unknown): PolicyRule[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r) => typeof r === "object" && r !== null && typeof r.variable === "string")
    .map((r: Record<string, unknown>) => ({
      variable: r.variable as string,
      required: typeof r.required === "boolean" ? r.required : false,
      allowedSeverities: Array.isArray(r.allowedSeverities)
        ? (r.allowedSeverities as string[])
        : undefined,
      description: typeof r.description === "string" ? r.description : undefined,
    }));
}

export function loadPolicy(dir: string, policyFile?: string): PolicyConfig | undefined {
  const candidates = policyFile
    ? [policyFile]
    : DEFAULT_POLICY_FILES.map((f) => path.join(dir, f));

  for (const filePath of candidates) {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(dir, filePath);
    if (fs.existsSync(resolved)) {
      try {
        const raw = JSON.parse(fs.readFileSync(resolved, "utf-8"));
        const rules = parseRules(raw.rules ?? raw);
        const strict = typeof raw.strict === "boolean" ? raw.strict : false;
        return { rules, strict };
      } catch {
        console.warn(`[env-audit] Failed to parse policy file: ${resolved}`);
      }
    }
  }

  return undefined;
}
