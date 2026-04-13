import chalk from 'chalk';
import { AuditReport, ReportIssue, Severity } from './types';

const severityColor: Record<Severity, (s: string) => string> = {
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.cyan,
};

const severityIcon: Record<Severity, string> = {
  error: '✖',
  warning: '⚠',
  info: 'ℹ',
};

function formatIssue(issue: ReportIssue): string {
  const color = severityColor[issue.severity];
  const icon = severityIcon[issue.severity];
  const header = color(`${icon} [${issue.severity.toUpperCase()}] ${issue.variable}`);
  const lines = [header, `  ${issue.message}`];
  if (issue.locations && issue.locations.length > 0) {
    lines.push(`  Locations: ${issue.locations.join(', ')}`);
  }
  return lines.join('\n');
}

export function formatText(report: AuditReport): string {
  const lines: string[] = [];
  lines.push(chalk.bold(`\nenv-audit Report — ${report.timestamp}`));
  lines.push(chalk.gray(`Project: ${report.projectRoot}\n`));

  if (report.issues.length === 0) {
    lines.push(chalk.green('✔ No issues found.'));
  } else {
    report.issues.forEach((issue) => lines.push(formatIssue(issue)));
  }

  const { totalIssues, errors, warnings, infos } = report.summary;
  lines.push(
    `\nSummary: ${totalIssues} issue(s) — ` +
      chalk.red(`${errors} error(s)`) +
      ', ' +
      chalk.yellow(`${warnings} warning(s)`) +
      ', ' +
      chalk.cyan(`${infos} info(s)`)
  );

  return lines.join('\n');
}

export function formatJson(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}
