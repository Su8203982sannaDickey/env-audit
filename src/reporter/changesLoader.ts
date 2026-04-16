import * as fs from 'fs';
import * as path from 'path';
import { Report } from './types';

export function loadPreviousReport(filePath: string): Report | null {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) return null;
  try {
    const raw = fs.readFileSync(resolved, 'utf-8');
    return JSON.parse(raw) as Report;
  } catch {
    return null;
  }
}

export function savePreviousReport(filePath: string, report: Report): void {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, JSON.stringify(report, null, 2), 'utf-8');
}
