import * as fs from "fs";
import * as path from "path";

export interface RedactConfig {
  patterns: RegExp[];
}

const DEFAULT_CONFIG: RedactConfig = {
  patterns: [
    /password/i,
    /secret/i,
    /token/i,
    /api[_-]?key/i,
    /private[_-]?key/i,
    /auth/i,
    /credential/i,
  ],
};

export function parseRedactConfig(raw: unknown): RedactConfig {
  if (typeof raw !== "object" || raw === null) return DEFAULT_CONFIG;
  const obj = raw as Record<string, unknown>;
  const patterns: RegExp[] = [...DEFAULT_CONFIG.patterns];

  if (Array.isArray(obj.patterns)) {
    for (const p of obj.patterns) {
      if (typeof p === "string") {
        try {
          patterns.push(new RegExp(p, "i"));
        } catch {
          // skip invalid patterns
        }
      }
    }
  }

  return { patterns };
}

export function loadRedactConfig(
  dir: string,
  filename = ".env-audit-redact.json"
): RedactConfig {
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) return DEFAULT_CONFIG;
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return parseRedactConfig(raw);
  } catch {
    return DEFAULT_CONFIG;
  }
}
