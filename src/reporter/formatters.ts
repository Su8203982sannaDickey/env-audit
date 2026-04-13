import { Report } from './types';
import { formatHtml } from './htmlFormatter';
import { formatMarkdown } from './markdownFormatter';
import { formatConsole } from './consoleFormatter';
import { formatCsv } from './csvFormatter';
import { formatJson } from './jsonFormatter';
import { formatXml } from './xmlFormatter';
import { formatYaml } from './yamlFormatter';
import { formatSarif } from './sariffFormatter';

export type OutputFormat = 'text' | 'json' | 'html' | 'markdown' | 'csv' | 'xml' | 'yaml' | 'sarif';

export function colorize(text: string, color: string): string {
  const codes: Record<string, string> = {
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    reset: '\x1b[0m',
  };
  return `${codes[color] ?? ''}${text}${codes.reset}`;
}

export function formatIssue(issue: Report['issues'][number]): string {
  return `[${issue.severity.toUpperCase()}] ${issue.variable}: ${issue.message}`;
}

export function formatText(report: Report): string {
  return formatConsole(report);
}

export function formatOutput(report: Report, format: OutputFormat): string {
  switch (format) {
    case 'html':     return formatHtml(report);
    case 'markdown': return formatMarkdown(report);
    case 'csv':      return formatCsv(report);
    case 'json':     return formatJson(report);
    case 'xml':      return formatXml(report);
    case 'yaml':     return formatYaml(report);
    case 'sarif':    return formatSarif(report);
    case 'text':     return formatText(report);
    default:         return formatText(report);
  }
}
