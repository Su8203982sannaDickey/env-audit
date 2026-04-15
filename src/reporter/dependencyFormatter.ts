import { Report, Issue } from "./types";

interface DependencyNode {
  variable: string;
  referencedBy: string[];
  severity: string;
  type: string;
}

function buildDependencyGraph(issues: Issue[]): DependencyNode[] {
  return issues.map((issue) => {
    const files = issue.locations
      ? issue.locations.map((l) => l.file)
      : [];
    const unique = Array.from(new Set(files));
    return {
      variable: issue.variable,
      referencedBy: unique,
      severity: issue.severity,
      type: issue.type,
    };
  });
}

function formatNodeBlock(node: DependencyNode, index: number): string {
  const lines: string[] = [];
  lines.push(`[${index + 1}] ${node.variable}`);
  lines.push(`    type     : ${node.type}`);
  lines.push(`    severity : ${node.severity}`);
  if (node.referencedBy.length > 0) {
    lines.push(`    files    :`);
    node.referencedBy.forEach((f) => lines.push(`      - ${f}`));
  } else {
    lines.push(`    files    : (none)`);
  }
  return lines.join("\n");
}

export function formatDependency(report: Report): string {
  const nodes = buildDependencyGraph(report.issues);
  if (nodes.length === 0) {
    return "Dependency Graph\n================\n(no issues found)\n";
  }
  const blocks = nodes.map((n, i) => formatNodeBlock(n, i));
  const header = `Dependency Graph\n================\nTotal variables: ${nodes.length}\n`;
  return header + "\n" + blocks.join("\n\n") + "\n";
}
