import { formatCsv } from '../csvFormatter';
import { Report, Issue } from '../types';

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === 'error').length,
      warnings: issues.filter((i) => i.severity === 'warning').length,
      infos: issues.filter((i) => i.severity === 'info').length,
    },
  };
}

describe('formatCsv', () => {
  it('outputs CSV header row', () => {
    const report = makeReport([]);
    const output = formatCsv(report);
    expect(output.startsWith('type,severity,variable,message,locations')).toBe(true);
  });

  it('formats a single issue correctly', () => {
    const report = makeReport([
      {
        type: 'missing',
        severity: 'error',
        variable: 'DATABASE_URL',
        message: 'Variable DATABASE_URL is used in source but not defined in any .env file.',
        locations: [{ file: 'src/db.ts', line: 10 }],
      },
    ]);
    const lines = formatCsv(report).trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('missing');
    expect(lines[1]).toContain('DATABASE_URL');
    expect(lines[1]).toContain('src/db.ts:10');
  });

  it('escapes fields containing commas', () => {
    const report = makeReport([
      {
        type: 'undocumented',
        severity: 'warning',
        variable: 'API_KEY',
        message: 'Found in .env, but not documented, undescribed',
        locations: [],
      },
    ]);
    const lines = formatCsv(report).trim().split('\n');
    expect(lines[1]).toContain('"Found in .env, but not documented, undescribed"');
  });

  it('handles issues with no locations', () => {
    const report = makeReport([
      {
        type: 'duplicate',
        severity: 'warning',
        variable: 'PORT',
        message: 'PORT is defined in multiple .env files.',
        locations: [],
      },
    ]);
    const lines = formatCsv(report).trim().split('\n');
    expect(lines[1]).toMatch(/PORT.*PORT is defined/);
    const lastField = lines[1].split(',').pop();
    expect(lastField).toBe('');
  });

  it('handles multiple issues', () => {
    const report = makeReport([
      { type: 'missing', severity: 'error', variable: 'A', message: 'msg A', locations: [] },
      { type: 'duplicate', severity: 'warning', variable: 'B', message: 'msg B', locations: [] },
    ]);
    const lines = formatCsv(report).trim().split('\n');
    expect(lines).toHaveLength(3);
  });
});
