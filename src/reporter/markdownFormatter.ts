import { Report, Issue } from './types';

const SEVERITY_EMOJI: Record<Issue['severity'], string> = {
  error: '🔴',
  warning: '🟡',
  info: '🔵',
};

function formatIssueRow(issue: Issue): string {
  const emoji = SEVERITY_EMOJI[issue.severity] ?? '⚪';
  const location = issue.file
    ? `\`${issue.file}${issue.line ? `:${issue.line}` : ''}\``
    : '—';
  return `| ${emoji} ${issue.severity} | \`${issue.variable}\` | ${issue.message} | ${location} |`;
}

export function formatMarkdown(report: Report): string {
  const { summary } = report;
  const lines: string[] = [
    '# env-audit Report',
    '',
    '## Summary',
    '',
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Total Issues | ${summary.totalIssues} |`,
    `| Errors | ${summary.errors} |`,
    `| Warnings | ${summary.warnings} |`,
    `| Info | ${summary.info} |`,
    '',
    '## Issues',
    '',
  ];

  if (report.issues.length === 0) {
    lines.push('_No issues found. ✅_');
  } else {
    lines.push('| Severity | Variable | Message | Location |');
    lines.push('|----------|----------|---------|----------|');
    report.issues.forEach((issue) => lines.push(formatIssueRow(issue)));
  }

  lines.push('');
  lines.push(`_Generated at ${new Date().toUTCString()}_`);

  return lines.join('\n');
}
