export { parseEnvFile } from './envFileParser';
export type { EnvEntry, ParseResult } from './envFileParser';

import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile, ParseResult } from './envFileParser';

/**
 * Discovers and parses all .env* files within a given directory.
 * Returns an array of ParseResult for each file found.
 */
export function parseEnvFilesInDirectory(
  directory: string,
  pattern: RegExp = /^\.env(\.[\w.]+)?$/
): ParseResult[] {
  const absoluteDir = path.resolve(directory);

  if (!fs.existsSync(absoluteDir)) {
    throw new Error(`Directory does not exist: ${absoluteDir}`);
  }

  const files = fs.readdirSync(absoluteDir).filter((file) => pattern.test(file));

  if (files.length === 0) {
    return [];
  }

  return files.map((file) => parseEnvFile(path.join(absoluteDir, file)));
}

/**
 * Finds duplicate keys across multiple ParseResult sets.
 */
export function findDuplicateKeys(
  results: ParseResult[]
): Map<string, { filePath: string; lineNumber: number }[]> {
  const keyMap = new Map<string, { filePath: string; lineNumber: number }[]>();

  for (const result of results) {
    for (const entry of result.entries) {
      const existing = keyMap.get(entry.key) ?? [];
      existing.push({ filePath: entry.filePath, lineNumber: entry.lineNumber });
      keyMap.set(entry.key, existing);
    }
  }

  // Keep only keys that appear more than once
  for (const [key, occurrences] of keyMap.entries()) {
    if (occurrences.length < 2) {
      keyMap.delete(key);
    }
  }

  return keyMap;
}
