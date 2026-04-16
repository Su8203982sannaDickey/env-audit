import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { parseOwnerFile, loadOwnerConfig } from '../ownerLoader';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'env-audit-owner-'));
}

describe('parseOwnerFile', () => {
  it('parses simple owner entries', () => {
    const lines = ['DB_HOST @backend', 'API_KEY @security'];
    const result = parseOwnerFile(lines);
    expect(result).toEqual([
      { pattern: 'DB_HOST', owner: '@backend' },
      { pattern: 'API_KEY', owner: '@security' },
    ]);
  });

  it('ignores blank lines and comments', () => {
    const lines = ['# comment', '', 'PORT @devops', '  '];
    const result = parseOwnerFile(lines);
    expect(result).toEqual([{ pattern: 'PORT', owner: '@devops' }]);
  });

  it('returns empty array for empty input', () => {
    expect(parseOwnerFile([])).toEqual([]);
  });
});

describe('loadOwnerConfig', () => {
  it('loads from .envowners file', () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, '.envowners'), 'SECRET @security\nHOST @infra\n');
    const result = loadOwnerConfig(dir);
    expect(result).toEqual([
      { pattern: 'SECRET', owner: '@security' },
      { pattern: 'HOST', owner: '@infra' },
    ]);
    fs.rmSync(dir, { recursive: true });
  });

  it('returns empty array when file does not exist', () => {
    const dir = makeTempDir();
    const result = loadOwnerConfig(dir);
    expect(result).toEqual([]);
    fs.rmSync(dir, { recursive: true });
  });
});
