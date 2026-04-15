import { Report, Issue } from './types';

type IssueSeverity = Issue['severity'];

const SEVERITY_ORDER: Record<IssueSeverity, number> = {
  error: 3,
  warning: 2,
  info: 1,
};

function computeComplexityScore(issues: Issue[]): number {
  return issues.reduce((score, issue) => {
    return score + SEVERITY_ORDER[issue.severity];
  }, 0);
}

function formatIssueLine(issue: Issue, index: number): string {
  const locations =
    issue.locations && issue.locations.length > 0
      ? issue.locations.map((l) => `${l.file}:${l.line}`).join(', ')
      : 'N/A';
  return `  [${index + 1}] [${issue.severity.toUpperCase()}] ${issue.variable} — ${issue.message} (${locations})`;
}

function formatSection(title: string, issues: Issue[]): string {
  if (issues.length === 0) return '';
  const lines = [`\n## ${title} (${issues.length})`, ...issues.map(formatIssueLine)];
  return lines.join('\n');
}

export function formatCyclomatic(report: Report): string {
  const { issues, summary } = report;

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  const score = computeComplexityScore(issues);
  const grade =
    score === 0 ? 'A' : score <= 3 ? 'B' : score <= 8 ? 'C' : score <= 15 ? 'D' : 'F';

  const header = [
    '# Env Audit — Cyclomatic Report',
    `Scanned: ${summary.scannedFiles} file(s) | Variables: ${summary.totalVariables} | Issues: ${summary.totalIssues}`,
    `Complexity Score: ${score} | Grade: ${grade}`,
  ].join('\n');

  const sections = [
    formatSection('Errors', errors),
    formatSection('Warnings', warnings),
    formatSection('Info', infos),
  ]
    .filter(Boolean)
    .join('\n');

  return sections ? `${header}\n${sections}\n` : `${header}\n\nNo issues found.\n`;
}
