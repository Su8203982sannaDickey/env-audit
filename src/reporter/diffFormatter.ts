import { Report, Issue } from "./types";

type DiffEntry = {
  variable: string;
  status: "+" | "-" | "~";
  detail: string;
};

function issueToEntry(issue: Issue): DiffEntry {
  switch (issue.type) {
    case "missing":
      return { variable: issue.variable, status: "-", detail: "missing from .env file" };
    case "duplicate":
      return { variable: issue.variable, status: "~", detail: `duplicate key (${issue.locations?.map(l => l.file).join(", ")})` };
    case "undocumented":
      return { variable: issue.variable, status: "+", detail: "used in source but not declared in .env" };
    default:
      return { variable: issue.variable, status: "~", detail: issue.message };
  }
}

function formatEntry(entry: DiffEntry): string {
  const prefix = entry.status === "+" ? "+" : entry.status === "-" ? "-" : "~";
  return `${prefix} ${entry.variable.padEnd(40)} # ${entry.detail}`;
}

export function formatDiff(report: Report): string {
  const lines: string[] = [];

  lines.push("--- .env (declared)");
  lines.push("+++ source (used)");
  lines.push("");

  if (report.issues.length === 0) {
    lines.push("  (no issues found — all variables are consistent)");
    return lines.join("\n");
  }

  for (const issue of report.issues) {
    lines.push(formatEntry(issueToEntry(issue)));
  }

  lines.push("");
  lines.push(
    `@@ ${report.summary.totalIssues} issue(s): ` +
    `${report.summary.missing} missing, ` +
    `${report.summary.duplicates} duplicate, ` +
    `${report.summary.undocumented} undocumented @@`
  );

  return lines.join("\n");
}
