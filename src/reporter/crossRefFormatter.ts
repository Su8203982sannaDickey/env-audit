import { Report, Issue } from "./types";

interface CrossRefEntry {
  variable: string;
  definedInEnv: boolean;
  usedInSource: boolean;
  severity: string;
}

function buildCrossRef(issues: Issue[]): CrossRefEntry[] {
  return issues.map((issue) => ({
    variable: issue.variable,
    definedInEnv: issue.type !== "missing",
    usedInSource: issue.type !== "undocumented",
    severity: issue.severity,
  }));
}

function check(val: boolean): string {
  return val ? "✔" : "✘";
}

function formatRow(entry: CrossRefEntry): string {
  const name = entry.variable.padEnd(30);
  const env = check(entry.definedInEnv).padEnd(8);
  const src = check(entry.usedInSource).padEnd(8);
  return `  ${name} ${env} ${src} [${entry.severity}]`;
}

export function formatCrossRef(report: Report): string {
  const entries = buildCrossRef(report.issues);
  if (entries.length === 0) {
    return "Cross-Reference Report\n======================\n(no issues)\n";
  }
  const header = [
    "Cross-Reference Report",
    "======================",
    `  ${ "Variable".padEnd(30) } ${ "In .env".padEnd(8) } ${ "In src".padEnd(8) } Severity`,
    `  ${ "-".repeat(30) } ${ "-".repeat(8) } ${ "-".repeat(8) } --------`,
  ].join("\n");
  const rows = entries.map(formatRow).join("\n");
  return header + "\n" + rows + "\n";
}
