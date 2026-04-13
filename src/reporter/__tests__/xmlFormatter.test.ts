import { formatXml } from '../xmlFormatter';
import { Report, Issue } from '../types';

function makeReport(overrides: Partial<Report> = {}): Report {
  const issues: Issue[] = [
    {
      type: 'missing',
      severity: 'error',
      variable: 'DATABASE_URL',
      message: 'Variable DATABASE_URL is used in source but not defined in any .env file.',
      locations: [{ file: 'src/db.ts', line: 12 }],
    },
    {
      type: 'duplicate',
      severity: 'warning',
      variable: 'API_KEY',
      message: 'Variable API_KEY is defined in multiple .env files.',
      locations: [
        { file: '.env', line: 3 },
        { file: '.env.local', line: 1 },
      ],
    },
    {
      type: 'undocumented',
      severity: 'info',
      variable: 'SECRET_TOKEN',
      message: 'Variable SECRET_TOKEN is defined in .env but never used in source code.',
    },
  ];

  return {
    summary: { totalIssues: 3, missing: 1, duplicates: 1, undocumented: 1 },
    issues,
    ...overrides,
  };
}

describe('formatXml', () => {
  it('should include XML declaration', () => {
    const output = formatXml(makeReport());
    expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  });

  it('should include summary block with correct counts', () => {
    const output = formatXml(makeReport());
    expect(output).toContain('<totalIssues>3</totalIssues>');
    expect(output).toContain('<missing>1</missing>');
    expect(output).toContain('<duplicates>1</duplicates>');
    expect(output).toContain('<undocumented>1</undocumented>');
  });

  it('should include issue elements for each issue', () => {
    const output = formatXml(makeReport());
    expect(output).toContain('<variable>DATABASE_URL</variable>');
    expect(output).toContain('<variable>API_KEY</variable>');
    expect(output).toContain('<variable>SECRET_TOKEN</variable>');
  });

  it('should include location elements when present', () => {
    const output = formatXml(makeReport());
    expect(output).toContain('file="src/db.ts" line="12"');
    expect(output).toContain('file=".env" line="3"');
    expect(output).toContain('file=".env.local" line="1"');
  });

  it('should omit locations block when issue has no locations', () => {
    const report = makeReport();
    const undocumented = report.issues.find((i) => i.type === 'undocumented')!;
    expect(undocumented.locations).toBeUndefined();
    const output = formatXml(report);
    // Ensure SECRET_TOKEN issue block has no <locations> tag
    const secretBlock = output.split('<issue>').find((block) =>
      block.includes('<variable>SECRET_TOKEN</variable>')
    );
    expect(secretBlock).not.toContain('<locations>');
  });

  it('should escape special XML characters in messages', () => {
    const report = makeReport({
      issues: [
        {
          type: 'missing',
          severity: 'error',
          variable: 'VAR_WITH_SPECIAL',
          message: 'Value contains <special> & "quoted" characters.',
        },
      ],
    });
    const output = formatXml(report);
    expect(output).toContain('&lt;special&gt;');
    expect(output).toContain('&amp;');
    expect(output).toContain('&quot;quoted&quot;');
  });
});
