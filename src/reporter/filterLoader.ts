import * as fs from "fs";
import * as path from "path";
import { FilterOptions } from "./filterFormatter";

interface RawFilterConfig {
  severity?: string | string[];
  type?: string | string[];
  file?: string;
  variable?: string;
}

function toArray(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

export function parseFilterConfig(raw: RawFilterConfig): FilterOptions {
  return {
    severity: toArray(raw.severity),
    type: toArray(raw.type),
    file: raw.file,
    variable: raw.variable,
  };
}

export function loadFilterConfig(configPath?: string): FilterOptions {
  const candidates = [
    configPath,
    path.resolve(process.cwd(), ".env-audit-filter.json"),
    path.resolve(process.cwd(), ".env-audit-filter.js"),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const ext = path.extname(candidate);
        if (ext === ".json") {
          const raw = JSON.parse(fs.readFileSync(candidate, "utf-8")) as RawFilterConfig;
          return parseFilterConfig(raw);
        } else if (ext === ".js") {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const raw = require(candidate) as RawFilterConfig;
          return parseFilterConfig(raw);
        }
      } catch {
        // ignore malformed configs
      }
    }
  }

  return {};
}
