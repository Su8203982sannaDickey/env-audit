import { Report, Issue } from "./types";

const DEFAULT_TEMPLATE = `ENV AUDIT REPORT
================
Directory: {{directory}}
Scanned At: {{scannedAt}}

Summary:
  Total Issues : {{totalIssues}}
  Critical     : {{critical}}
  Warning      : {{warning}}
  Info         : {{info}}

Issues:
{{#issues}}
[{{severity}}] {{variable}} — {{message}}
  Locations: {{locations}}
{{/issues}}
{{^issues}}
No issues found.
{{/issues}}
`;

function formatLocations(issue: Issue): string {
  if (!issue.locations || issue.locations.length === 0) return "N/A";
  return issue.locations
    .map((l) => (l.line !== undefined ? `${l.file}:${l.line}` : l.file))
    .join(", ");
}

function renderIssueBlock(
  template: string,
  issues: Issue[]
): string {
  const issueBlockMatch = template.match(/\{\{#issues\}\}([\s\S]*?)\{\{\/issues\}\}/);
  const emptyBlockMatch = template.match(/\{\{\^issues\}\}([\s\S]*?)\{\{\/issues\}\}/);

  const issueTemplate = issueBlockMatch ? issueBlockMatch[1] : "";
  const emptyTemplate = emptyBlockMatch ? emptyBlockMatch[1] : "";

  const rendered =
    issues.length > 0
      ? issues
          .map((issue) =>
            issueTemplate
              .replace(/\{\{severity\}\}/g, issue.severity.toUpperCase())
              .replace(/\{\{variable\}\}/g, issue.variable)
              .replace(/\{\{message\}\}/g, issue.message)
              .replace(/\{\{locations\}\}/g, formatLocations(issue))
          )
          .join("")
      : emptyTemplate;

  return template
    .replace(/\{\{#issues\}\}[\s\S]*?\{\{\/issues\}\}/g, rendered)
    .replace(/\{\{\^issues\}\}[\s\S]*?\{\{\/issues\}\}/g, "");
}

export function formatTemplate(
  report: Report,
  template: string = DEFAULT_TEMPLATE
): string {
  const { summary, issues } = report;
  const now = new Date().toISOString();

  let output = renderIssueBlock(template, issues);

  output = output
    .replace(/\{\{directory\}\}/g, summary.directory)
    .replace(/\{\{scannedAt\}\}/g, now)
    .replace(/\{\{totalIssues\}\}/g, String(summary.totalIssues))
    .replace(/\{\{critical\}\}/g, String(summary.critical))
    .replace(/\{\{warning\}\}/g, String(summary.warning))
    .replace(/\{\{info\}\}/g, String(summary.info));

  return output;
}
