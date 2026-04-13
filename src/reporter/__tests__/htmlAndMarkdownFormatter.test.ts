import { formatHtml } from '../htmlFormatter';
import { formatMarkdown } from '../markdownFormatter';
import { Report } from '../types';

const emptyReport: Report = {
  issues: [],
  summary: { totalIssues: 0, errors: 0, warnings: 0, info: 0 },
};

const fullReport: Report = {
  issues: [
    { severity: 'error', variable: 'DB_URL', message: 'Missing in .env', file: '.env', line: undefined },
    { severity: 'warning', variable: 'API_KEY', message: 'Duplicate key found', file: '.env.local', line: 3 },
    { severity: 'info', variable: 'DEBUG', message: 'Used in source but not documented', file: 'src/app.ts', line: 12 },
  ],
  summary: { totalIssues: 3, errors: 1, warnings: 1, info: 1 },
};

describe('formatHtml', () => {
  it('produces a valid HTML document', () => {
    const html = formatHtml(fullReport);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>env-audit Report</title>');
  });

  it('includes all issue variables', () => {
    const html = formatHtml(fullReport);
    expect(html).toContain('DB_URL');
    expect(html).toContain('API_KEY');
    expect(html).toContain('DEBUG');
  });

  it('shows no-issues message for empty report', () => {
    const html = formatHtml(emptyReport);
    expect(html).toContain('No issues found.');
  });

  it('reflects summary counts', () => {
    const html = formatHtml(fullReport);
    expect(html).toContain('Total issues:</strong> 3');
    expect(html).toContain('Errors:</strong> 1');
  });
});

describe('formatMarkdown', () => {
  it('contains a markdown heading', () => {
    const md = formatMarkdown(fullReport);
    expect(md).toContain('# env-audit Report');
  });

  it('includes severity emojis for issues', () => {
    const md = formatMarkdown(fullReport);
    expect(md).toContain('🔴');
    expect(md).toContain('🟡');
    expect(md).toContain('🔵');
  });

  it('shows all variable names', () => {
    const md = formatMarkdown(fullReport);
    expect(md).toContain('DB_URL');
    expect(md).toContain('API_KEY');
    expect(md).toContain('DEBUG');
  });

  it('shows no-issues message for empty report', () => {
    const md = formatMarkdown(emptyReport);
    expect(md).toContain('No issues found');
  });

  it('includes a summary table', () => {
    const md = formatMarkdown(fullReport);
    expect(md).toContain('## Summary');
    expect(md).toContain('| Total Issues | 3 |');
  });
});
