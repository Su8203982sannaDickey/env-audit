import { Report, Issue } from './types';

const CSV_HEADER = 'type,severity,variable,message,locations';

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function formatLocations(issue: Issue): string {
  if (!issue.locations || issue.locations.length === 0) return '';
  return issue.locations
    .map((loc) => `${loc.file}:${loc.line ?? ''}`)
    .join('; ');
}

function formatIssueRow(issue: Issue): string {
  const fields = [
    issue.type,
    issue.severity,
    issue.variable ?? '',
    issue.message,
    formatLocations(issue),
  ];
  return fields.map(escapeCsvField).join(',');
}

export function formatCsv(report: Report): string {
  const rows: string[] = [CSV_HEADER];

  for (const issue of report.issues) {
    rows.push(formatIssueRow(issue));
  }

  return rows.join('\n') + '\n';
}
