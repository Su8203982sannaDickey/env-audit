import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseEnvFile } from '../envFileParser';

function writeTempEnv(content: string): string {
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `.env.test.${Date.now()}`);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

describe('parseEnvFile', () => {
  afterEach(() => {
    // Cleanup handled per test
  });

  it('parses basic key=value pairs', () => {
    const file = writeTempEnv('API_KEY=abc123\nDB_HOST=localhost\n');
    const result = parseEnvFile(file);
    expect(result.errors).toHaveLength(0);
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]).toMatchObject({ key: 'API_KEY', value: 'abc123', lineNumber: 1 });
    expect(result.entries[1]).toMatchObject({ key: 'DB_HOST', value: 'localhost', lineNumber: 2 });
    fs.unlinkSync(file);
  });

  it('ignores comments and blank lines', () => {
    const file = writeTempEnv('# comment\n\nFOO=bar\n');
    const result = parseEnvFile(file);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].key).toBe('FOO');
    fs.unlinkSync(file);
  });

  it('strips surrounding quotes from values', () => {
    const file = writeTempEnv('SECRET="my secret"\nTOKEN=\'token123\'\n');
    const result = parseEnvFile(file);
    expect(result.entries[0].value).toBe('my secret');
    expect(result.entries[1].value).toBe('token123');
    fs.unlinkSync(file);
  });

  it('reports error for lines missing =', () => {
    const file = writeTempEnv('INVALID_LINE\n');
    const result = parseEnvFile(file);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('missing');
    fs.unlinkSync(file);
  });

  it('returns error for non-existent file', () => {
    const result = parseEnvFile('/nonexistent/.env');
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('File not found');
    expect(result.entries).toHaveLength(0);
  });

  it('handles values containing = signs', () => {
    const file = writeTempEnv('URL=http://example.com?foo=bar\n');
    const result = parseEnvFile(file);
    expect(result.entries[0].value).toBe('http://example.com?foo=bar');
    fs.unlinkSync(file);
  });
});
