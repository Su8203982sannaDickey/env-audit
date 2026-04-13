import {
  buildSummary,
  buildReport,
  issueFromMissing,
  issueFromDuplicate,
  issueFromUndocumented,
} from '../reportBuilder';
import { ReportIssue } from '../types';

describe('issueFromMissing', () => {
  it('creates an error-level missing issue', () => {
    const issue = issueFromMissing('DATABASE_URL', ['src/db.ts:12']);
    expect(issue.type).toBe('missing');
    expect(issue.severity).toBe('error');
    expect(issue.variable).toBe('DATABASE_URL');
    expect(issue.locations).toContain('src/db.ts:12');
  });
});

describe('issueFromDuplicate', () => {
  it('creates a warning-level duplicate issue', () => {
    const issue = issueFromDuplicate('API_KEY', ['.env', '.env.local']);
    expect(issue.type).toBe('duplicate');
    expect(issue.severity).toBe('warning');
    expect(issue.locations).toHaveLength(2);
  });
});

describe('issueFromUndocumented', () => {
  it('creates an info-level undocumented issue', () => {
    const issue = issueFromUndocumented('UNUSED_VAR');
    expect(issue.type).toBe('undocumented');
    expect(issue.severity).toBe('info');
    expect(issue.locations).toBeUndefined();
  });
});

describe('buildSummary', () => {
  it('counts issues by severity correctly', () => {
    const issues: ReportIssue[] = [
      issueFromMissing('A', []),
      issueFromMissing('B', []),
      issueFromDuplicate('C', []),
      issueFromUndocumented('D'),
    ];
    const summary = buildSummary(issues);
    expect(summary.totalIssues).toBe(4);
    expect(summary.errors).toBe(2);
    expect(summary.warnings).toBe(1);
    expect(summary.infos).toBe(1);
    expect(summary.totalVariables).toBe(4);
  });

  it('returns zero counts for empty issues', () => {
    const summary = buildSummary([]);
    expect(summary.totalIssues).toBe(0);
    expect(summary.errors).toBe(0);
  });
});

describe('buildReport', () => {
  it('includes a timestamp and projectRoot', () => {
    const issues = [issueFromMissing('SECRET', ['app.ts'])];
    const report = buildReport('/my/project', issues);
    expect(report.projectRoot).toBe('/my/project');
    expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(report.issues).toHaveLength(1);
    expect(report.summary.errors).toBe(1);
  });
});
