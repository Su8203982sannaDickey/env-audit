import { Report, Issue } from './types';

function severityColor(severity: Issue['severity']): string {
  switch (severity) {
    case 'error': return '#e74c3c';
    case 'warning': return '#f39c12';
    case 'info': return '#3498db';
    default: return '#95a5a6';
  }
}

function renderIssueRow(issue: Issue): string {
  const color = severityColor(issue.severity);
  const location = issue.file ? `${issue.file}${issue.line ? `:${issue.line}` : ''}` : '—';
  return `
    <tr>
      <td style="color:${color};font-weight:bold;text-transform:uppercase">${issue.severity}</td>
      <td>${issue.variable}</td>
      <td>${issue.message}</td>
      <td><code>${location}</code></td>
    </tr>`;
}

export function formatHtml(report: Report): string {
  const issueRows = report.issues.map(renderIssueRow).join('');
  const generatedAt = new Date().toUTCString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>env-audit Report</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; color: #333; }
    h1 { color: #2c3e50; }
    .summary { background: #f4f6f7; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #2c3e50; color: #fff; padding: 0.5rem 1rem; text-align: left; }
    td { padding: 0.5rem 1rem; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f9f9f9; }
    .footer { margin-top: 1rem; font-size: 0.8rem; color: #999; }
  </style>
</head>
<body>
  <h1>env-audit Report</h1>
  <div class="summary">
    <strong>Total issues:</strong> ${report.summary.totalIssues} &nbsp;|
    <strong>Errors:</strong> ${report.summary.errors} &nbsp;|
    <strong>Warnings:</strong> ${report.summary.warnings} &nbsp;|
    <strong>Info:</strong> ${report.summary.info}
  </div>
  <table>
    <thead><tr><th>Severity</th><th>Variable</th><th>Message</th><th>Location</th></tr></thead>
    <tbody>${issueRows || '<tr><td colspan="4">No issues found.</td></tr>'}</tbody>
  </table>
  <p class="footer">Generated at ${generatedAt}</p>
</body>
</html>`;
}
