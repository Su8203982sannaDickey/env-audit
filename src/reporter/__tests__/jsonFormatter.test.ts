import { formatJson } from '../jsonFormatter';
import { Report, Issue } from '../types';

function makeReport(overrides: Partial<Report> = {}): Report {
  const defaultIssues: Issue[] = [
    {
      type: 'missing',
      severity: 'error',
      variable: 'DATABASE_URL',
      message: 'DATABASE_URL is used in source but not defined in any .env file.',
      locations: ['src/db.ts:12'],
    },
    {
      type: 'duplicate',
      severity: 'warning',
      variable: 'API_KEY',
      message: 'API_KEY is defined in multiple .env files.',
      locations: ['.env:3', '.env.local:7'],
    },
    {
      type: 'undocumented',
      severity: 'info',
      variable: 'FEATURE_FLAG',
      message: 'FEATURE_FLAG is defined in .env but never used in source code.',
      locations: ['.env:10'],
    },
  ];

  return {
    issues: defaultIssues,
    ...overrides,
  };
}

describe('formatJson', () => {
  it('returns valid JSON string', () => {
    const report = makeReport();
    const result = formatJson(report);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('includes correct summary counts', () => {
    const report = makeReport();
    const parsed = JSON.parse(formatJson(report));
    expect(parsed.summary.totalIssues).toBe(3);
    expect(parsed.summary.missingCount).toBe(1);
    expect(parsed.summary.duplicateCount).toBe(1);
    expect(parsed.summary.undocumentedCount).toBe(1);
  });

  it('includes scannedAt timestamp', () => {
    const report = makeReport();
    const parsed = JSON.parse(formatJson(report));
    expect(typeof parsed.summary.scannedAt).toBe('string');
    expect(new Date(parsed.summary.scannedAt).toString()).not.toBe('Invalid Date');
  });

  it('maps issues with correct fields', () => {
    const report = makeReport();
    const parsed = JSON.parse(formatJson(report));
    const first = parsed.issues[0];
    expect(first.type).toBe('missing');
    expect(first.severity).toBe('error');
    expect(first.variable).toBe('DATABASE_URL');
    expect(Array.isArray(first.locations)).toBe(true);
    expect(first.locations).toContain('src/db.ts:12');
  });

  it('handles empty issues list', () => {
    const report = makeReport({ issues: [] });
    const parsed = JSON.parse(formatJson(report));
    expect(parsed.summary.totalIssues).toBe(0);
    expect(parsed.issues).toHaveLength(0);
  });

  it('defaults missing locations to empty array', () => {
    const report = makeReport({
      issues: [
        {
          type: 'missing',
          severity: 'error',
          variable: 'SECRET',
          message: 'SECRET is missing.',
        },
      ],
    });
    const parsed = JSON.parse(formatJson(report));
    expect(parsed.issues[0].locations).toEqual([]);
  });
});
