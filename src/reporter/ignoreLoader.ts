import * as fs from "fs";
import * as path from "path";
import { IgnoreConfig, IgnoreRule } from "./ignoreFormatter";

const DEFAULT_IGNORE_FILE = ".envauditignore";

export function parseIgnoreFile(content: string): IgnoreConfig {
  const rules: IgnoreRule[] = [];
  const lines = content.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const [variable, ...rest] = line.split(":");
    const trimmedVar = variable.trim();
    if (!trimmedVar) continue;
    const reason = rest.join(":").trim() || undefined;
    rules.push({ variable: trimmedVar, reason });
  }
  return { rules };
}

export function loadIgnoreConfig(
  dir: string,
  filename: string = DEFAULT_IGNORE_FILE
): IgnoreConfig {
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) {
    return { rules: [] };
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return parseIgnoreFile(content);
}
