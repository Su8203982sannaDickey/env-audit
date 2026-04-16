import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { loadPreviousReport, savePreviousReport } from '../changesLoader';
import { Report } from '../types';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'changes-loader-'));
}

function makeReport(): Report {
  return { issues: [], summary: { total: 0, errors: 0, warnings: 0, infos: 0 } } as unknown as Report;
}

describe('loadPreviousReport', () => {
  it('returns null when file does not exist', () => {
    const result = loadPreviousReport('/nonexistent/path/report.json');
    expect(result).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const dir = makeTempDir();
    const file = path.join(dir, 'bad.json');
    fs.writeFileSync(file, 'not-json');
    expect(loadPreviousReport(file)).toBeNull();
  });

  it('loads a valid report', () => {
    const dir = makeTempDir();
    const file = path.join(dir, 'report.json');
    const report = makeReport();
    fs.writeFileSync(file, JSON.stringify(report));
    const loaded = loadPreviousReport(file);
    expect(loaded).not.toBeNull();
    expect(loaded!.issues).toEqual([]);
  });
});

describe('savePreviousReport', () => {
  it('writes report to file', () => {
    const dir = makeTempDir();
    const file = path.join(dir, 'sub', 'report.json');
    const report = makeReport();
    savePreviousReport(file, report);
    expect(fs.existsSync(file)).toBe(true);
    const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
    expect(content.issues).toEqual([]);
  });

  it('creates intermediate directories', () => {
    const dir = makeTempDir();
    const file = path.join(dir, 'a', 'b', 'c', 'report.json');
    savePreviousReport(file, makeReport());
    expect(fs.existsSync(file)).toBe(true);
  });
});
