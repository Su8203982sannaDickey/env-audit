import * as fs from 'fs';
import * as path from 'path';
import { OwnerRule } from './ownerFormatter';

function parseLine(line: string): OwnerRule | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return null;
  return { pattern: parts[0], owner: parts[1] };
}

export function parseOwnerFile(content: string): OwnerRule[] {
  return content
    .split('\n')
    .map(parseLine)
    .filter((r): r is OwnerRule => r !== null);
}

export function loadOwnerConfig(dir: string): OwnerRule[] {
  const candidates = ['.envowners', 'env.owners'];
  for (const name of candidates) {
    const filePath = path.join(dir, name);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return parseOwnerFile(content);
    }
  }
  return [];
}
