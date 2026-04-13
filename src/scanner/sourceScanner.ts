import * as fs from 'fs';
import * as path from 'path';

const ENV_VAR_PATTERNS = [
  /process\.env\.([A-Z_][A-Z0-9_]*)/g,
  /process\.env\[['"](\w+)['"]\]/g,
];

export interface EnvUsage {
  variable: string;
  file: string;
  line: number;
}

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next']);

export function scanFileForEnvUsage(filePath: string): EnvUsage[] {
  const usages: EnvUsage[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    for (const pattern of ENV_VAR_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(line)) !== null) {
        usages.push({
          variable: match[1],
          file: filePath,
          line: index + 1,
        });
      }
    }
  });

  return usages;
}

export function scanDirectoryForEnvUsage(
  dirPath: string,
  extensions: string[] = ['.ts', '.js', '.tsx', '.jsx']
): EnvUsage[] {
  const allUsages: EnvUsage[] = [];

  function walk(currentPath: string): void {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        const usages = scanFileForEnvUsage(fullPath);
        allUsages.push(...usages);
      }
    }
  }

  walk(dirPath);
  return allUsages;
}

export function groupUsagesByVariable(usages: EnvUsage[]): Map<string, EnvUsage[]> {
  const grouped = new Map<string, EnvUsage[]>();

  for (const usage of usages) {
    const existing = grouped.get(usage.variable) ?? [];
    existing.push(usage);
    grouped.set(usage.variable, existing);
  }

  return grouped;
}
