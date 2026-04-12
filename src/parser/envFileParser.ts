import * as fs from 'fs';
import * as path from 'path';

export interface EnvEntry {
  key: string;
  value: string;
  lineNumber: number;
  filePath: string;
}

export interface ParseResult {
  entries: EnvEntry[];
  filePath: string;
  errors: string[];
}

/**
 * Parses a .env file and extracts key-value pairs.
 * Supports comments (#), blank lines, and quoted values.
 */
export function parseEnvFile(filePath: string): ParseResult {
  const absolutePath = path.resolve(filePath);
  const errors: string[] = [];
  const entries: EnvEntry[] = [];

  if (!fs.existsSync(absolutePath)) {
    return { entries, filePath: absolutePath, errors: [`File not found: ${absolutePath}`] };
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    // Skip blank lines and comments
    if (!trimmed || trimmed.startsWith('#')) return;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      errors.push(`Line ${lineNumber}: Invalid format (missing '=') — "${trimmed}"`);
      return;
    }

    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();

    if (!key) {
      errors.push(`Line ${lineNumber}: Empty key detected`);
      return;
    }

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    entries.push({ key, value, lineNumber, filePath: absolutePath });
  });

  return { entries, filePath: absolutePath, errors };
}
