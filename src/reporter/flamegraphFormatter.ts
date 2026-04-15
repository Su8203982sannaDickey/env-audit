import { Report, Issue } from "./types";

interface FlamegraphNode {
  name: string;
  value: number;
  children: FlamegraphNode[];
}

function severityWeight(severity: string): number {
  switch (severity) {
    case "error": return 3;
    case "warn": return 2;
    case "info": return 1;
    default: return 1;
  }
}

function buildFileNode(file: string, issues: Issue[]): FlamegraphNode {
  const children: FlamegraphNode[] = issues.map((issue) => ({
    name: `[${issue.severity.toUpperCase()}] ${issue.variable} (${issue.type})`,
    value: severityWeight(issue.severity),
    children: [],
  }));

  return {
    name: file,
    value: children.reduce((sum, c) => sum + c.value, 0),
    children,
  };
}

function groupIssuesByFile(issues: Issue[]): Map<string, Issue[]> {
  const map = new Map<string, Issue[]>();
  for (const issue of issues) {
    const file =
      issue.locations && issue.locations.length > 0
        ? issue.locations[0].file
        : "<unknown>";
    if (!map.has(file)) map.set(file, []);
    map.get(file)!.push(issue);
  }
  return map;
}

export function formatFlamegraph(report: Report): string {
  const grouped = groupIssuesByFile(report.issues);

  const rootChildren: FlamegraphNode[] = [];
  for (const [file, issues] of grouped.entries()) {
    rootChildren.push(buildFileNode(file, issues));
  }

  const root: FlamegraphNode = {
    name: "env-audit",
    value: rootChildren.reduce((sum, c) => sum + c.value, 0),
    children: rootChildren,
  };

  return JSON.stringify(root, null, 2);
}
