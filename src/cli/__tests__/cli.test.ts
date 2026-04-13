import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

function createTempProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-audit-cli-test-'));
  return dir;
}

function runCli(args: string): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(`ts-node src/cli/index.ts ${args}`, {
      encoding: 'utf-8',
    });
    return { stdout, stderr: '', code: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
      code: err.status ?? 1,
    };
  }
}

describe('CLI audit command', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('exits with code 0 when no issues are found', () => {
    fs.writeFileSync(path.join(tmpDir, '.env'), 'API_KEY=secret\n');
    fs.writeFileSync(
      path.join(tmpDir, 'index.js'),
      'const key = process.env.API_KEY;\n'
    );
    const result = runCli(`audit ${tmpDir}`);
    expect(result.code).toBe(0);
  });

  it('exits with code 1 when there are undocumented variables', () => {
    fs.writeFileSync(path.join(tmpDir, '.env'), '');
    fs.writeFileSync(
      path.join(tmpDir, 'index.js'),
      'const key = process.env.MISSING_VAR;\n'
    );
    const result = runCli(`audit ${tmpDir}`);
    expect(result.code).toBe(1);
  });

  it('outputs valid JSON when --format json is passed', () => {
    fs.writeFileSync(path.join(tmpDir, '.env'), 'DB_URL=postgres://localhost\n');
    fs.writeFileSync(
      path.join(tmpDir, 'app.ts'),
      'const db = process.env.DB_URL;\n'
    );
    const result = runCli(`audit ${tmpDir} --format json`);
    expect(() => JSON.parse(result.stdout)).not.toThrow();
    const parsed = JSON.parse(result.stdout);
    expect(parsed).toHaveProperty('summary');
    expect(parsed).toHaveProperty('issues');
  });
});
