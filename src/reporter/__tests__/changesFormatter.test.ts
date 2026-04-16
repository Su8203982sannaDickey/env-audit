import { diffIssues, formatChanges, ChangeEntry } from '../changesFormatter';
import { Report, Issue } from '../types';

function makeIssue(variable: string, severity: string, message: string): Issue {
  return { variable, severity, message, type: 'missing', locations: [] } as unknown as Issue;
}

function makeReport(issues: Issue[]): Report {
  return { issues, summary: { total: issues.length, errors: 0, warnings: 0, infos: 0 } } as unknown as Report;
}

describe('diffIssues', () => {
  it('detects added issues', () => {
    const prev: Issue[] = [];
    const curr = [makeIssue('NEW_VAR', 'error', 'missing')];
    const result = diffIssues(prev, curr);
    expect(result).toHaveLength(1);
    expect(result[0].changeType).toBe('added');
    expect(result[0].variable).toBe('NEW_VAR');
  });

  it('detects removed issues', () => {
    const prev = [makeIssue('OLD_VAR', 'error', 'missing')];
    const curr: Issue[] = [];
    const result = diffIssues(prev, curr);
    expect(result).toHaveLength(1);
    expect(result[0].changeType).toBe('removed');
  });

  it('detects changed issues', () => {
    const prev = [makeIssue('VAR', 'warning', 'undocumented')];
    const curr = [makeIssue('VAR', 'error', 'undocumented')];
    const result = diffIssues(prev, curr);
    expect(result).toHaveLength(1);
    expect(result[0].changeType).toBe('changed');
    expect(result[0].detail).toContain('warning → error');
  });

  it('returns empty when no changes', () => {
    const issues = [makeIssue('VAR', 'error', 'missing')];
    expect(diffIssues(issues, issues)).toHaveLength(0);
  });
});

describe('formatChanges', () => {
  it('returns no-change message when identical', () => {
    const r = makeReport([makeIssue('VAR', 'error', 'missing')]);
    expect(formatChanges(r, r)).toBe('No changes detected.\n');
  });

  it('includes added symbol', () => {
    const prev = makeReport([]);
    const curr = makeReport([makeIssue('API_KEY', 'error', 'missing')]);
    const out = formatChanges(prev, curr);
    expect(out).toContain('[+] API_KEY');
  });

  it('includes total changes count', () => {
    const prev = makeReport([]);
    const curr = makeReport([makeIssue('A', 'error', 'x'), makeIssue('B', 'warning', 'y')]);
    expect(formatChanges(prev, curr)).toContain('Total changes: 2');
  });
});
