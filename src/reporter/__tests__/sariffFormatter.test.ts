import { formatSarif } from '../sariffFormatter';
import { Report, Issue } from '../types';

function makeReport(issues: Issue[] = []): Report {
  return {
    scannedAt: '2024-01-01T00:00:00.000Z',
    directory: '/project',
    summary: {
      total: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      infos: issues.filter(i => i.severity === 'info').length,
    },
    issues,
  };
}

describe('formatSarif', () => {
  it('produces valid SARIF 2.1.0 structure', () => {
    const output = formatSarif(makeReport());
    const parsed = JSON.parse(output);
    expect(parsed.version).toBe('2.1.0');
    expect(parsed.$schema).toContain('sarif');
    expect(parsed.runs).toHaveLength(1);
    expect(parsed.runs[0].tool.driver.name).toBe('env-audit');
  });

  it('maps error severity to SARIF level error', () => {
    const issue: Issue = {
      type: 'missing',
      severity: 'error',
      message: 'DB_URL is missing',
      variable: 'DB_URL',
      locations: [{ file: 'src/db.ts', line: 10 }],
    };
    const output = formatSarif(makeReport([issue]));
    const parsed = JSON.parse(output);
    expect(parsed.runs[0].results[0].level).toBe('error');
    expect(parsed.runs[0].results[0].ruleId).toBe('missing');
  });

  it('maps warning severity to SARIF level warning', () => {
    const issue: Issue = {
      type: 'duplicate',
      severity: 'warning',
      message: 'PORT is duplicated',
      variable: 'PORT',
      locations: [{ file: '.env', line: 3 }, { file: '.env.local', line: 1 }],
    };
    const output = formatSarif(makeReport([issue]));
    const parsed = JSON.parse(output);
    expect(parsed.runs[0].results[0].level).toBe('warning');
    expect(parsed.runs[0].results[0].locations).toHaveLength(2);
  });

  it('maps info severity to SARIF level note', () => {
    const issue: Issue = {
      type: 'undocumented',
      severity: 'info',
      message: 'SECRET_KEY is undocumented',
      variable: 'SECRET_KEY',
      locations: [],
    };
    const output = formatSarif(makeReport([issue]));
    const parsed = JSON.parse(output);
    expect(parsed.runs[0].results[0].level).toBe('note');
  });

  it('handles issues with no locations gracefully', () => {
    const issue: Issue = {
      type: 'undocumented',
      severity: 'info',
      message: 'UNUSED_VAR is undocumented',
      variable: 'UNUSED_VAR',
      locations: [],
    };
    const output = formatSarif(makeReport([issue]));
    const parsed = JSON.parse(output);
    const result = parsed.runs[0].results[0];
    expect(result.locations[0].physicalLocation.artifactLocation.uri).toBe('unknown');
  });

  it('returns empty results array for report with no issues', () => {
    const output = formatSarif(makeReport([]));
    const parsed = JSON.parse(output);
    expect(parsed.runs[0].results).toHaveLength(0);
  });
});
