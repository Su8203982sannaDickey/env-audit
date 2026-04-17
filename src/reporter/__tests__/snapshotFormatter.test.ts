import { buildSnapshotEntry, formatSnapshot } from '../snapshotFormatter';
import type { Report } from '../types';

function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    summary: { total: 1, missing: 1, duplicate: 0, undocumented: 0 },
    issues: [
      {
        variable: 'API_KEY',
        type: 'missing',
        severity: 'error',
        message: 'Missing variable',
        locations: [{ file: 'src/app.ts', line: 10 }],
      },
    ],
    ...overrides,
  };
}

describe('buildSnapshotEntry', () => {
  it('builds an entry from an issue', () => {
    const issue = makeReport().issues[0];
    const entry = buildSnapshotEntry(issue, '2024-01-01T00:00:00.000Z');
    expect(entry.variable).toBe('API_KEY');
    expect(entry.issueType).toBe('missing');
    expect(entry.severity).toBe('error');
    expect(entry.locations).toEqual(['src/app.ts:10']);
    expect(entry.capturedAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('handles missing locations gracefully', () => {
    const issue = { ...makeReport().issues[0], locations: undefined };
    const entry = buildSnapshotEntry(issue as any, '2024-01-01T00:00:00.000Z');
    expect(entry.locations).toEqual([]);
  });
});

describe('formatSnapshot', () => {
  it('returns valid JSON', () => {
    const output = formatSnapshot(makeReport());
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes all issues', () => {
    const output = formatSnapshot(makeReport());
    const parsed = JSON.parse(output);
    expect(parsed.totalIssues).toBe(1);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.version).toBe(1);
  });

  it('sets capturedAt timestamp', () => {
    const output = formatSnapshot(makeReport());
    const parsed = JSON.parse(output);
    expect(typeof parsed.capturedAt).toBe('string');
    expect(parsed.capturedAt.length).toBeGreaterThan(0);
  });
});
