import { formatReminder } from '../reminderFormatter';
import { Report, Issue } from '../types';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function makeIssue(variable: string, type: string, daysOld?: number): Issue {
  return {
    variable,
    type: type as Issue['type'],
    severity: 'warning',
    message: `${type} issue for ${variable}`,
    locations: [],
    firstSeen: daysOld !== undefined ? daysAgo(daysOld) : undefined,
  };
}

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: { total: issues.length, errors: 0, warnings: issues.length, info: 0 },
  };
}

describe('formatReminder', () => {
  it('includes header and generated date', () => {
    const report = makeReport([]);
    const out = formatReminder(report);
    expect(out).toContain('# Reminder Report');
    expect(out).toContain('Generated:');
  });

  it('marks stale issues (30+ days)', () => {
    const report = makeReport([makeIssue('OLD_VAR', 'missing', 35)]);
    const out = formatReminder(report);
    expect(out).toContain('[STALE]');
    expect(out).toContain('OLD_VAR');
  });

  it('marks aging issues (7-29 days)', () => {
    const report = makeReport([makeIssue('MID_VAR', 'duplicate', 10)]);
    const out = formatReminder(report);
    expect(out).toContain('[AGING]');
  });

  it('marks fresh issues (< 7 days)', () => {
    const report = makeReport([makeIssue('NEW_VAR', 'undocumented', 2)]);
    const out = formatReminder(report);
    expect(out).toContain('[  OK ]');
  });

  it('sorts stale issues first', () => {
    const report = makeReport([
      makeIssue('NEW_VAR', 'missing', 1),
      makeIssue('OLD_VAR', 'missing', 40),
    ]);
    const out = formatReminder(report);
    const oldIdx = out.indexOf('OLD_VAR');
    const newIdx = out.indexOf('NEW_VAR');
    expect(oldIdx).toBeLessThan(newIdx);
  });

  it('prints summary counts', () => {
    const report = makeReport([
      makeIssue('A', 'missing', 35),
      makeIssue('B', 'missing', 10),
      makeIssue('C', 'missing', 1),
    ]);
    const out = formatReminder(report);
    expect(out).toContain('1 stale');
    expect(out).toContain('1 aging');
    expect(out).toContain('1 fresh');
  });
});
