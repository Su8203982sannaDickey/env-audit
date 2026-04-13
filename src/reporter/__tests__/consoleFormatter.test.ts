import { formatConsole } from '../consoleFormatter';
import { Report, Issue } from '../types';

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      totalIssues: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      infos: issues.filter(i => i.severity === 'info').length,
      scannedFiles: 5,
      envFiles: 2,
    },
  };
}

describe('formatConsole', () => {
  it('should display a no-issues message when report is clean', () => {
    const report = makeReport([]);
    const output = formatConsole(report);
    expect(output).toContain('No issues found');
    expect(output).toContain('Summary');
  });

  it('should display issues grouped by type', () => {
    const issues: Issue[] = [
      { type: 'missing', severity: 'error', variable: 'DATABASE_URL', message: 'Used in code but not defined in any .env file' },
      { type: 'undocumented', severity: 'warning', variable: 'SECRET_KEY', message: 'Defined in .env but never used in source code' },
    ];
    const report = makeReport(issues);
    const output = formatConsole(report);
    expect(output).toContain('DATABASE_URL');
    expect(output).toContain('SECRET_KEY');
    expect(output).toContain('missing'.toUpperCase());
    expect(output).toContain('undocumented'.toUpperCase());
  });

  it('should include file and line info when available', () => {
    const issues: Issue[] = [
      { type: 'missing', severity: 'error', variable: 'API_KEY', message: 'Missing', file: 'src/index.ts', line: 12 },
    ];
    const report = makeReport(issues);
    const output = formatConsole(report);
    expect(output).toContain('src/index.ts');
    expect(output).toContain('12');
  });

  it('should include summary counts', () => {
    const issues: Issue[] = [
      { type: 'missing', severity: 'error', variable: 'DB_HOST', message: 'Missing' },
      { type: 'duplicate', severity: 'warning', variable: 'PORT', message: 'Duplicate key' },
    ];
    const report = makeReport(issues);
    const output = formatConsole(report);
    expect(output).toContain('Total Issues');
    expect(output).toContain('Errors');
    expect(output).toContain('Warnings');
    expect(output).toContain('Scanned Files');
    expect(output).toContain('5');
    expect(output).toContain('2');
  });

  it('should handle info severity issues', () => {
    const issues: Issue[] = [
      { type: 'undocumented', severity: 'info', variable: 'LOG_LEVEL', message: 'Defined but usage is unclear' },
    ];
    const report = makeReport(issues);
    const output = formatConsole(report);
    expect(output).toContain('LOG_LEVEL');
    expect(output).toContain('[INFO]');
  });
});
