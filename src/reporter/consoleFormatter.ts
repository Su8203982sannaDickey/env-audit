import { Report, Issue, IssueSeverity } from './types';
import { colorize, formatIssue } from './formatters';

function formatSectionHeader(title: string): string {
  const line = '─'.repeat(50);
  return `\n${colorize(line, 'cyan')}\n${colorize(title.toUpperCase(), 'bold')}\n${colorize(line, 'cyan')}`;
}

function formatSeverityBadge(severity: IssueSeverity): string {
  switch (severity) {
    case 'error':
      return colorize('[ERROR]', 'red');
    case 'warning':
      return colorize('[WARN] ', 'yellow');
    case 'info':
      return colorize('[INFO] ', 'blue');
    default:
      return colorize('[????] ', 'reset');
  }
}

function formatIssueLine(issue: Issue): string {
  const badge = formatSeverityBadge(issue.severity);
  const variable = colorize(issue.variable, 'bold');
  const location = issue.file ? colorize(` (${issue.file}${issue.line ? `:${issue.line}` : ''})`, 'dim') : '';
  return `  ${badge} ${variable}: ${issue.message}${location}`;
}

function formatSummaryBlock(report: Report): string {
  const { summary } = report;
  const total = colorize(String(summary.totalIssues), summary.totalIssues > 0 ? 'red' : 'green');
  const errors = colorize(String(summary.errors), summary.errors > 0 ? 'red' : 'reset');
  const warnings = colorize(String(summary.warnings), summary.warnings > 0 ? 'yellow' : 'reset');
  const infos = colorize(String(summary.infos), 'blue');

  return [
    formatSectionHeader('Summary'),
    `  Total Issues : ${total}`,
    `  Errors       : ${errors}`,
    `  Warnings     : ${warnings}`,
    `  Info         : ${infos}`,
    `  Scanned Files: ${summary.scannedFiles}`,
    `  Env Files    : ${summary.envFiles}`,
  ].join('\n');
}

export function formatConsole(report: Report): string {
  const lines: string[] = [];

  lines.push(formatSectionHeader('Env Audit Report'));

  if (report.issues.length === 0) {
    lines.push(colorize('\n  ✔ No issues found. Your environment variables look great!', 'green'));
  } else {
    const grouped: Record<string, Issue[]> = {};
    for (const issue of report.issues) {
      if (!grouped[issue.type]) grouped[issue.type] = [];
      grouped[issue.type].push(issue);
    }

    for (const [type, issues] of Object.entries(grouped)) {
      lines.push(formatSectionHeader(type.replace(/_/g, ' ')));
      for (const issue of issues) {
        lines.push(formatIssueLine(issue));
      }
    }
  }

  lines.push(formatSummaryBlock(report));
  lines.push('');

  return lines.join('\n');
}
