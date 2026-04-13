import { Report, Issue } from "./types";

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;"
    );
}

function severityToCheckstyle(severity: Issue["severity"]): string {
  switch (severity) {
    case "error":
      return "error":
      return "warning";
    case "info":
      return "info";
    default:
      return "warning";
  }
}

function iss(issue: Issue): string {
  const location = issue.locations?.[0];
  const line = location?.line ?? 1;
  const col = 0;
  const source = `env-audit.${issue.type}`;
  const severity = severityToCheckstyle(issue.severity);
  const msg = escapeXmlAttr(issue.message);
  return `    <error line="${line}" column="${col}" severity="${severity}" message="${msg}" source="${source}"/>`;
}

function groupByFile(issues: Issue[]): Map<string, Issue[]> {
  const map = new Map<string, Issue[]>();
  for (const issue of issues) {
    const files = issue.locations?.map((l) => l.file) ?? ["unknown"];
    const unique = [...new Set(files)];
    for (const file of unique) {
      if (!map.has(file)) map.set(file, []);
      map.get(file)!.push(issue);
    }
  }
  if (issues.some((i) => !i.locations?.length)) {
    const noLoc = issues.filter((i) => !i.locations?.length);
    map.set("unknown", [...(map.get("unknown") ?? []), ...noLoc]);
  }
  return map;
}

export function formatCheckstyle(report: Report): string {
  const allIssues = [
    ...report.missing,
    ...report.duplicates,
    ...report.undocumented,
  ];
  const byFile = groupByFile(allIssues);
  const fileBlocks: string[] = [];
  for (const [file, issues] of byFile.entries()) {
    const errors = issues.map(issueToError).join("\n");
    fileBlocks.push(
      `  <file name="${escapeXmlAttr(file)}">
${errors}
  </file>`
    );
  }
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<checkstyle version="8.0">`,
    ...fileBlocks,
    `</checkstyle>`,
  ].join("\n");
}
