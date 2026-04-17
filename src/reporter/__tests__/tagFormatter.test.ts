import { extractTags, groupByTag, formatTag } from '../tagFormatter';
import { Report, Issue } from '../types';

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    variable: 'MY_VAR',
    type: 'missing',
    severity: 'error',
    message: 'Variable is missing',
    locations: [{ file: 'src/app.ts', line: 10 }],
    ...overrides
  };
}

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: {
      totalIssues: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      infos: issues.filter(i => i.severity === 'info').length
    }
  };
}

describe('extractTags', () => {
  it('returns type, severity, and file extension', () => {
    const tags = extractTags(makeIssue());
    expect(tags).toContain('missing');
    expect(tags).toContain('error');
    expect(tags).toContain('ts');
  });

  it('handles issue with no locations', () => {
    const tags = extractTags(makeIssue({ locations: [] }));
    expect(tags).toEqual(['missing', 'error']);
  });
});

describe('groupByTag', () => {
  it('groups issues by each tag', () => {
    const issues = [makeIssue(), makeIssue({ type: 'duplicate', severity: 'warning' })];
    const grouped = groupByTag(issues);
    expect(grouped.get('missing')).toHaveLength(1);
    expect(grouped.get('duplicate')).toHaveLength(1);
    expect(grouped.get('ts')).toHaveLength(2);
  });
});

describe('formatTag', () => {
  it('returns no issues message when empty', () => {
    const out = formatTag(makeReport([]));
    expect(out).toBe('No issues found.\n');
  });

  it('includes tag headers and issue lines', () => {
    const out = formatTag(makeReport([makeIssue()]));
    expect(out).toContain('[missing]');
    expect(out).toContain('[error]');
    expect(out).toContain('MY_VAR');
    expect(out).toContain('src/app.ts:10');
  });

  it('shows issue count in header', () => {
    const out = formatTag(makeReport([makeIssue(), makeIssue({ variable: 'OTHER' })]));
    expect(out).toMatch(/\[missing\] \(2 issues\)/);
  });
});
