import { Report, Issue } from './types';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatLocations(issue  if (!issue.locations || issue.locations.length === 0) {
    return '';
  }
  const locationags = issue.locations
    .map(
      (loc) =>
        `       file="${escapeXml(loc.file)}" line="${loc.line}" />`
    )
    .join('\n');
  return `    <locations>\n${locationTags}\n    </locations>`;
}

function formatIssueElement(issue: Issue): string {
  const locations = formatLocations(issue);
  return [
    `  <issue>`,
    `    <type>${escapeXml(issue.type)}</type>`,
    `    <severity>${escapeXml(issue.severity)}</severity>`,
    `    <variable>${escapeXml(issue.variable)}</variable>`,
    `    <message>${escapeXml(issue.message)}</message>`,
    locations ? locations : '',
    `  </issue>`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatXml(report: Report): string {
  const { summary, issues } = report;
  const issueElements = issues.map(formatIssueElement).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<envAuditReport>',
    '  <summary>',
    `    <totalIssues>${summary.totalIssues}</totalIssues>`,
    `    <missing>${summary.missing}</missing>`,
    `    <duplicates>${summary.duplicates}</duplicates>`,
    `    <undocumented>${summary.undocumented}</undocumented>`,
    '  </summary>',
    '  <issues>',
    issueElements,
    '  </issues>',
    '</envAuditReport>',
  ].join('\n');
}
