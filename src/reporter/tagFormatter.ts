import { Report, Issue } from './types';

export function extractTags(issue: Issue): string[] {
  const tags: string[] = [issue.type, issue.severity];
  if (issue.locations && issue.locations.length > 0) {
    const ext = issue.locations[0].file.split('.').pop();
    if (ext) tags.push(ext);
  }
  return tags;
}

export function groupByTag(issues: Issue[]): Map<string, Issue[]> {
  const map = new Map<string, Issue[]>();
  for (const issue of issues) {
    for (const tag of extractTags(issue)) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(issue);
    }
  }
  return map;
}

export function formatTagSection(tag: string, issues: Issue[]): string {
  const lines: string[] = [`[${tag}] (${issues.length} issue${issues.length !== 1 ? 's' : ''})`);
  for (const issue of issues) {
    const loc = issue.locations && issue.locations.length > 0
      ? ` @ ${issue.locations[0].file}:${issue.locations[0].line}`
      : '';
    lines.push(`  - [${issue.severity}] ${issue.variable}: ${issue.message}${loc}`);
  }
  return lines.join('\n');
}

export function formatTag(report: Report): string {
  const grouped = groupByTag(report.issues);
  if (grouped.size === 0) return 'No issues found.\n';
  const sections: string[] = [
    `env-audit tag report — ${report.summary.totalIssues} issue(s) across ${grouped.size} tag(s)`,
    ''
  ];
  for (const [tag, issues] of Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    sections.push(formatTagSection(tag, issues));
    sections.push('');
  }
  return sections.join('\n');
}
