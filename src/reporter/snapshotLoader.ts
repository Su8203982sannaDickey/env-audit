import * as fs from 'fs';
import * as path from 'path';
import type { Snapshot } from './snapshotFormatter';

export function parseSnapshot(raw: string): Snapshot {
  try {
    const obj = JSON.parse(raw);
    if (typeof obj !== 'object' || !Array.isArray(obj.entries)) {
      throw new Error('Invalid snapshot format');
    }
    return obj as Snapshot;
  } catch {
    throw new Error('Failed to parse snapshot file');
  }
}

export function loadSnapshot(filePath: string): Snapshot | null {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) return null;
  const raw = fs.readFileSync(resolved, 'utf-8');
  return parseSnapshot(raw);
}

export function saveSnapshot(filePath: string, content: string): void {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, content, 'utf-8');
}
