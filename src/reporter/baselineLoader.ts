import * as fs from "fs";
import * as path from "path";
import { BaselineFile } from "./baselineFormatter";

export const DEFAULT_BASELINE_FILE = ".env-audit-baseline.json";

export function parseBaseline(content: string): BaselineFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Baseline file is not valid JSON");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as BaselineFile).entries)
  ) {
    throw new Error("Baseline file has invalid structure");
  }

  return parsed as BaselineFile;
}

export function loadBaseline(
  baselinePath?: string
): BaselineFile | null {
  const filePath = baselinePath
    ? path.resolve(baselinePath)
    : path.resolve(process.cwd(), DEFAULT_BASELINE_FILE);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return parseBaseline(content);
}

export function saveBaseline(
  baseline: BaselineFile,
  baselinePath?: string
): void {
  const filePath = baselinePath
    ? path.resolve(baselinePath)
    : path.resolve(process.cwd(), DEFAULT_BASELINE_FILE);

  fs.writeFileSync(filePath, JSON.stringify(baseline, null, 2), "utf-8");
}
