import { Report, Issue, IssueSeverity } from './types';

const SEVERITY_COLORS: Record<IssueSeverity, string> = {
  error: '\x1b[31m',
  warning: '\x1b[33m',
  info: '\x1b[36m',
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function colorize(text: string, severity: IssueSeverity): string {
  return `${SEVERITY_COLORS[severity]}${text}${RESET}`;
}

export function formatIssue(issue: Issue, useColor = true): string {
  const prefix = `[${issue.severity.toUpperCase()}]`;
  const location = issue.file
    ? ` (${issue.file}${issue.line !== undefined ? `:${issue.line}` : ''})`
    : '';
  const message = `${prefix} ${issue.variable}: ${issue.message}${location}`;
  return useColor ? colorize(message, issue.severity) : message;
}

export function formatText(report: Report, useColor = true): string {
  const lines: string[] = [];

  const title = 'env-audit Report';
  lines.push(useColor ? `${BOLD}${title}${RESET}` : title);
  lines.push('='.repeat(40));
  lines.push(`Scanned: ${report.summary.scannedFiles} file(s)`);
  lines.push(`Env variables defined: ${report.summary.totalDefined}`);
  lines.push(`Issues found: ${report.summary.totalIssues}`);
  lines.push('');

  if (report.issues.length === 0) {
    lines.push(useColor ? `\x1b[32mNo issues found.${RESET}` : 'No issues found.');
  } else {
    for (const issue of report.issues) {
      lines.push(formatIssue(issue, useColor));
    }
  }

  lines.push('');
  lines.push(`Errors: ${report.summary.errors}  Warnings: ${report.summary.warnings}  Info: ${report.summary.infos}`);

  return lines.join('\n');
}

export function formatJson(report: Report): string {
  return JSON.stringify(report, null, 2);
}
