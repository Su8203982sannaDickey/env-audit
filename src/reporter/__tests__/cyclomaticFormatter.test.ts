import { formatCyclomatic } from '../cyclomaticFormatter';
import { Report, Issue } from '../types';

function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    issues: [],
    summary: {
      scannedFiles: 5,
      totalVariables: 10,
      totalIssues: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
    },
    ...overrides,
  };
}

const errorIssue: Issue = {
  severity: 'error',
  variable: 'DB_PASSWORD',
  message: 'Missing in .env file',
  locations: [{ file: 'src/db.ts', line: 12 }],
};

const warningIssue: Issue = {
  severity: 'warning',
  variable: 'API_KEY',
  message: 'Duplicate key found',
  locations: [{ file: '.env', line: 3 }, { file: '.env.local', line: 1 }],
};

const infoIssue: Issue = {
  severity: 'info',
  variable: 'LOG_LEVEL',
  message: 'Undocumented variable',
  locations: [],
};

describe('formatCyclomatic', () => {
  it('shows no issues message when report is clean', () => {
    const output = formatCyclomatic(makeReport());
    expect(output).toContain('No issues found.');
    expect(output).toContain('Grade: A');
    expect(output).toContain('Complexity Score: 0');
  });

  it('includes header with summary stats', () => {
    const output = formatCyclomatic(makeReport());
    expect(output).toContain('Scanned: 5 file(s)');
    expect(output).toContain('Variables: 10');
  });

  it('assigns grade F for high complexity score', () => {
    const issues = Array(6).fill(errorIssue);
    const report = makeReport({
      issues,
      summary: { scannedFiles: 5, totalVariables: 10, totalIssues: 6, errorCount: 6, warningCount: 0, infoCount: 0 },
    });
    const output = formatCyclomatic(report);
    expect(output).toContain('Grade: F');
  });

  it('renders error section with issue details', () => {
    const report = makeReport({
      issues: [errorIssue],
      summary: { scannedFiles: 5, totalVariables: 10, totalIssues: 1, errorCount: 1, warningCount: 0, infoCount: 0 },
    });
    const output = formatCyclomatic(report);
    expect(output).toContain('## Errors (1)');
    expect(output).toContain('DB_PASSWORD');
    expect(output).toContain('src/db.ts:12');
  });

  it('renders warning and info sections', () => {
    const report = makeReport({
      issues: [warningIssue, infoIssue],
      summary: { scannedFiles: 5, totalVariables: 10, totalIssues: 2, errorCount: 0, warningCount: 1, infoCount: 1 },
    });
    const output = formatCyclomatic(report);
    expect(output).toContain('## Warnings (1)');
    expect(output).toContain('## Info (1)');
    expect(output).toContain('API_KEY');
    expect(output).toContain('LOG_LEVEL');
  });

  it('shows N/A for locations when empty', () => {
    const report = makeReport({
      issues: [infoIssue],
      summary: { scannedFiles: 5, totalVariables: 10, totalIssues: 1, errorCount: 0, warningCount: 0, infoCount: 1 },
    });
    const output = formatCyclomatic(report);
    expect(output).toContain('N/A');
  });
});
