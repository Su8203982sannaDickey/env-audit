import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseSnapshot, loadSnapshot, saveSnapshot } from '../snapshotLoader';
import { formatSnapshot } from '../snapshotFormatter';
import type { Report } from '../types';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-test-'));
}

function makeReport(): Report {
  return {
    summary: { total: 1, missing: 1, duplicate: 0, undocumented: 0 },
    issues: [
      {
        variable: 'DB_URL',
        type: 'missing',
        severity: 'error',
        message: 'Missing variable',
        locations: [{ file: 'src/db.ts', line: 5 }],
      },
    ],
  };
}

describe('parseSnapshot', () => {
  it('parses valid snapshot JSON', () => {
    const raw = formatSnapshot(makeReport());
    const snap = parseSnapshot(raw);
    expect(snap.version).toBe(1);
    expect(snap.entries).toHaveLength(1);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseSnapshot('not-json')).toThrow('Failed to parse snapshot file');
  });

  it('throws if entries is missing', () => {
    expect(() => parseSnapshot(JSON.stringify({ version: 1 }))).toThrow('Invalid snapshot format');
  });
});

describe('loadSnapshot', () => {
  it('returns null if file does not exist', () => {
    const result = loadSnapshot('/nonexistent/path/snapshot.json');
    expect(result).toBeNull();
  });

  it('loads and parses a saved snapshot', () => {
    const dir = makeTempDir();
    const filePath = path.join(dir, 'snap.json');
    const content = formatSnapshot(makeReport());
    fs.writeFileSync(filePath, content, 'utf-8');
    const snap = loadSnapshot(filePath);
    expect(snap).not.toBeNull();
    expect(snap!.entries[0].variable).toBe('DB_URL');
  });
});

describe('saveSnapshot', () => {
  it('writes snapshot to disk', () => {
    const dir = makeTempDir();
    const filePath = path.join(dir, 'out', 'snap.json');
    const content = formatSnapshot(makeReport());
    saveSnapshot(filePath, content);
    expect(fs.existsSync(filePath)).toBe(true);
    const raw = fs.readFileSync(filePath, 'utf-8');
    expect(raw).toBe(content);
  });
});
