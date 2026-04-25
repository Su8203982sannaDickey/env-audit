import * as fs from "fs";
import * as path from "path";
import { SeverityFilterOptions, SeverityLevel } from "./severityFilterFormatter";

const VALID_SEVERITIES: SeverityLevel[] = ["error", "warning", "info"];

function parseSeverityList(raw: unknown): SeverityLevel[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is SeverityLevel =>
    typeof v === "string" && VALID_SEVERITIES.includes(v as SeverityLevel)
  );
}

function parseConfig(raw: Record<string, unknown>): SeverityFilterOptions {
  const opts: SeverityFilterOptions = {};
  if (
    typeof raw.minSeverity === "string" &&
    VALID_SEVERITIES.includes(raw.minSeverity as SeverityLevel)
  ) {
    opts.minSeverity = raw.minSeverity as SeverityLevel;
  }
  if (Array.isArray(raw.only)) {
    opts.only = parseSeverityList(raw.only);
  }
  if (Array.isArray(raw.exclude)) {
    opts.exclude = parseSeverityList(raw.exclude);
  }
  return opts;
}

export function loadSeverityFilterConfig(
  dir: string
): SeverityFilterOptions {
  const candidates = [
    path.join(dir, ".env-audit-severity.json"),
    path.join(dir, "env-audit.severity.json"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = JSON.parse(fs.readFileSync(candidate, "utf8"));
        if (typeof raw === "object" && raw !== null) {
          return parseConfig(raw as Record<string, unknown>);
        }
      } catch {
        // ignore malformed config
      }
    }
  }
  return {};
}
