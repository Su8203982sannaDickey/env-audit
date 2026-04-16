import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { parseOwnerFile, loadOwnerConfig } from '../ownerLoader';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'env-audit-ownerloader-'));
}

describe('parseOwnerFile', () => {
  it('parses multiple entries', () => {
    const lines = ['DB_URL @dba', 'REDIS_URL @infra'];
    expect(parseOwnerFile(lines)).toEqual([
      { pattern: 'DB_URL', owner: '@dba' },
      { pattern: 'REDIS_URL', owner: '@infra' },
    ]);
  });

  it('skips comment lines starting with #', () => {
    const lines = ['# this is a comment', 'TOKEN @auth'];
    expect(parseOwnerFile(lines)).toEqual([{ pattern: 'TOKEN', owner: '@auth' }]);
  });

  it('handles extra whitespace', () => {
    const lines = ['  MY_VAR   @team  '];
    expect(parseOwnerFile(lines)).toEqual([{ pattern: 'MY_VAR', owner: '@team' }]);
  });
});

describe('loadOwnerConfig', () => {
  it('returns rules from .envowners', () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, '.envowners'), 'API_SECRET @security\n');
    const result = loadOwnerConfig(dir);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ pattern: 'API_SECRET', owner: '@security' });
    fs.rmSync(dir, { recursive: true });
  });

  it('returns empty when no .envowners file', () => {
    const dir = makeTempDir();
    expect(loadOwnerConfig(dir)).toEqual([]);
    fs.rmSync(dir, { recursive: true });
  });
});
