import { Report, Issue } from './types';
import { formatConsole } from './consoleFormatter';

type Color = 'red' | 'green' | 'yellow' | 'blue' | 'cyan' | 'bold' | 'dim' | 'reset';

const ANSI: Record<Color, string> = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
};

export function colorize(text: string, color: Color): string {
  const useColor = process.env.NO_COLOR === undefined && process.stdout.isTTY !== false;
  if (!useColor) return text;
  return `${ANSI[color]}${text}${ANSI.reset}`;
}

export function formatIssue(issue: Issue): string {
  const location = issue.file
    ? ` at ${issue.file}${issue.line ? `:${issue.line}` : ''}`
    : '';
  return `[${issue.severity.toUpperCase()}] ${issue.variable}: ${issue.message}${location}`;
}

export function formatText(report: Report): string {
  return formatConsole(report);
}

export function formatJson(report: Report): string {
  return JSON.stringify(report, null, 2);
}
