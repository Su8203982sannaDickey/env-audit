import { formatBadge } from '../badgeFormatter';
import { Report, Issue } from '../types';

function makeReport(overrides: Partial<Report> = {}): Report {
  const defaultIssues: Issue[] = [
    {
      type: 'missing',
      severity: 'error',
      variable: 'DB_HOST',
      message: 'DB_HOST is missing from .env',
      locations: [],
    },
    {
      type: 'undocumented',
      severity: 'warning',
      variable: 'API_KEY',
      message: 'API_KEY is undocumented',
      locations: [],
    },
    {
      type: 'duplicate',
      severity: 'info',
      variable: 'PORT',
      message: 'PORT is duplicated',
      locations: [],
    },
  ];

  return {
    issues: defaultIssues,
    summary: { total: 3, errors: 1, warnings: 1, infos: 1 },
    scannedFiles: [],
    ...overrides,
  };
}

describe('formatBadge', () => {
  it('outputs markdown badge image links', () => {
    const output = formatBadge(makeReport());
    expect(output).toContain('![env-audit status]');
    expect(output).toContain('![errors]');
    expect(output).toContain('![warnings]');
    expect(output).toContain('![info]');
  });

  it('uses shields.io badge URLs', () => {
    const output = formatBadge(makeReport());
    expect(output).toContain('https://img.shields.io/badge/');
  });

  it('shows passing and brightgreen when no issues', () => {
    const report = makeReport({ issues: [], summary: { total: 0, errors: 0, warnings: 0, infos: 0 } });
    const output = formatBadge(report);
    expect(output).toContain('passing');
    expect(output).toContain('brightgreen');
  });

  it('shows red color when there are errors', () => {
    const output = formatBadge(makeReport());
    expect(output).toMatch(/errors.*red|red.*errors/);
  });

  it('respects custom style option', () => {
    const output = formatBadge(makeReport(), { style: 'for-the-badge' });
    expect(output).toContain('style=for-the-badge');
  });

  it('respects custom label option', () => {
    const output = formatBadge(makeReport(), { label: 'my-project' });
    expect(output).toContain('my--project');
  });

  it('includes comment header', () => {
    const output = formatBadge(makeReport());
    expect(output).toContain('<!-- env-audit badges -->');
  });

  it('encodes dashes in badge parts', () => {
    const output = formatBadge(makeReport(), { label: 'env-audit' });
    expect(output).toContain('env--audit');
  });
});
