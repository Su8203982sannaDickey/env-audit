import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { formatOwner, groupByOwner, matchOwner, OwnerRule } from '../ownerFormatter';
import { loadOwnerConfig, parseOwnerFile } from '../ownerLoader';
import { Report, Issue } from '../types';

const rules: OwnerRule[] = [
  { pattern: '^DB_', owner: 'team-db' },
  { pattern: '^AWS_', owner: 'team-infra' },
];

function makeIssue(variable: string): Issue {
  return {
    type: 'missing',
    severity: 'error',
    variable,
    message: `${variable} is missing`,
    locations: [{ file: 'src/app.ts', line: 1 }],
  };
}

function makeReport(issues: Issue[]): Report {
  return {
    issues,
    summary: { totalIssues: issues.length, errors: issues.length, warnings: 0, infos: 0 },
  };
}

describe('matchOwner', () => {
  it('returns matched owner', () => {
    expect(matchOwner('DB_HOST', rules)).toBe('team-db');
    expect(matchOwner('AWS_KEY', rules)).toBe('team-infra');
  });

  it('returns unowned for no match', () => {
    expect(matchOwner('UNKNOWN_VAR', rules)).toBe('unowned');
  });
});

describe('groupByOwner', () => {
  it('groups issues by owner', () => {
    const issues = [makeIssue('DB_HOST'), makeIssue('AWS_KEY'), makeIssue('OTHER')];
    const groups = groupByOwner(issues, rules);
    expect(groups.get('team-db')).toHaveLength(1);
    expect(groups.get('team-infra')).toHaveLength(1);
    expect(groups.get('unowned')).toHaveLength(1);
  });
});

describe('formatOwner', () => {
  it('includes owner headers and issue lines', () => {
    const report = makeReport([makeIssue('DB_HOST'), makeIssue('AWS_KEY')]);
    const output = formatOwner(report, rules);
    expect(output).toContain('## team-db');
    expect(output).toContain('## team-infra');
    expect(output).toContain('DB_HOST');
    expect(output).toContain('Total issues: 2');
  });
});

describe('parseOwnerFile / loadOwnerConfig', () => {
  it('parses owner file content', () => {
    const content = '# comment\n^DB_ team-db\n^AWS_ team-infra\n';
    const rules = parseOwnerFile(content);
    expect(rules).toHaveLength(2);
    expect(rules[0]).toEqual({ pattern: '^DB_', owner: 'team-db' });
  });

  it('loads from directory', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'owner-test-'));
    fs.writeFileSync(path.join(dir, '.envowners'), '^SECRET_ team-sec\n');
    const loaded = loadOwnerConfig(dir);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].owner).toBe('team-sec');
    fs.rmSync(dir, { recursive: true });
  });

  it('returns empty array if no file found', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'owner-empty-'));
    expect(loadOwnerConfig(dir)).toEqual([]);
    fs.rmSync(dir, { recursive: true });
  });
});
