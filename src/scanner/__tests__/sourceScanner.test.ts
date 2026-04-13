import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  scanFileForEnvUsage,
  scanDirectoryForEnvUsage,
  groupUsagesByVariable,
} from '../sourceScanner';

function writeTempFile(dir: string, filename: string, content: string): string {
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

describe('scanFileForEnvUsage', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-audit-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects process.env.VAR_NAME usage', () => {
    const file = writeTempFile(tmpDir, 'app.ts', `const x = process.env.API_KEY;\n`);
    const usages = scanFileForEnvUsage(file);
    expect(usages).toHaveLength(1);
    expect(usages[0].variable).toBe('API_KEY');
    expect(usages[0].line).toBe(1);
  });

  it('detects process.env["VAR"] bracket notation', () => {
    const file = writeTempFile(tmpDir, 'config.js', `const v = process.env["DB_HOST"];\n`);
    const usages = scanFileForEnvUsage(file);
    expect(usages).toHaveLength(1);
    expect(usages[0].variable).toBe('DB_HOST');
  });

  it('detects multiple variables in one file', () => {
    const content = `const a = process.env.SECRET;\nconst b = process.env.PORT;\n`;
    const file = writeTempFile(tmpDir, 'multi.ts', content);
    const usages = scanFileForEnvUsage(file);
    const vars = usages.map(u => u.variable);
    expect(vars).toContain('SECRET');
    expect(vars).toContain('PORT');
  });

  it('returns empty array for file with no env usage', () => {
    const file = writeTempFile(tmpDir, 'clean.ts', `const x = 42;\n`);
    expect(scanFileForEnvUsage(file)).toHaveLength(0);
  });
});

describe('groupUsagesByVariable', () => {
  it('groups usages by variable name', () => {
    const usages = [
      { variable: 'API_KEY', file: 'a.ts', line: 1 },
      { variable: 'API_KEY', file: 'b.ts', line: 5 },
      { variable: 'PORT', file: 'a.ts', line: 3 },
    ];
    const grouped = groupUsagesByVariable(usages);
    expect(grouped.get('API_KEY')).toHaveLength(2);
    expect(grouped.get('PORT')).toHaveLength(1);
  });
});
