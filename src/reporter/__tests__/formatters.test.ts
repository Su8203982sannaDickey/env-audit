import { formatIssue, formatText, formatJson } from '../formatters';
import { Issue, Report } from '../types';

const sampleIssue: Issue = {
  kind: 'missing',
  severity: 'error',
  variable: 'DATABASE_URL',
  message: 'Used in source but not defined in any .env file',
  file: 'src/db.ts',
  line: 12,
};

const sampleReport: Report = {
  summary: {
    scannedFiles: 5,
    totalDefined: 8,
    totalIssues: 2,
    errors: 1,
    warnings: 1,
    infos: 0,
  },
  issues: [
    sampleIssue,
    {
      kind: 'duplicate',
      severity: 'warning',
      variable: 'API_KEY',
      message: 'Defined in multiple .env files',
      file: '.env.production',
    },
  ],
};

describe('formatIssue', () => {
  it('formats an issue without color', () => {
    const result = formatIssue(sampleIssue, false);
    expect(result).toContain('[ERROR]');
    expect(result).toContain('DATABASE_URL');
    expect(result).toContain('src/db.ts:12');
  });

  it('includes ANSI codes when color is enabled', () => {
    const result = formatIssue(sampleIssue, true);
    expect(result).toContain('\x1b[31m');
  });

  it('omits line number when not provided', () => {
    const issue: Issue = { ...sampleIssue, line: undefined };
    const result = formatIssue(issue, false);
    expect(result).not.toMatch(/:\d+/);
    expect(result).toContain('src/db.ts');
  });
});

describe('formatText', () => {
  it('includes summary statistics', () => {
    const result = formatText(sampleReport, false);
    expect(result).toContain('Scanned: 5 file(s)');
    expect(result).toContain('Issues found: 2');
    expect(result).toContain('Errors: 1');
  });

  it('shows no-issues message when report is clean', () => {
    const cleanReport: Report = {
      summary: { scannedFiles: 3, totalDefined: 4, totalIssues: 0, errors: 0, warnings: 0, infos: 0 },
      issues: [],
    };
    const result = formatText(cleanReport, false);
    expect(result).toContain('No issues found.');
  });
});

describe('formatJson', () => {
  it('returns valid JSON matching the report', () => {
    const result = formatJson(sampleReport);
    const parsed = JSON.parse(result);
    expect(parsed.summary.totalIssues).toBe(2);
    expect(parsed.issues).toHaveLength(2);
  });
});
