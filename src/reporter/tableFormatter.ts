import { Report, Issue } from "./types";

function padEnd(str: string, length: number): string {
  return str.length >= length ? str : str + " ".repeat(length - str.length);
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

function buildRow(cells: string[], widths: number[]): string {
  return "| " + cells.map((c, i) => padEnd(truncate(c, widths[i]), widths[i])).join(" | ") + " |";
}

function buildSeparator(widths: number[]): string {
  return "|" + widths.map((w) => "-".repeat(w + 2)).join("|") + "|";
}

export function formatTable(report: Report): string {
  const headers = ["Variable", "Severity", "Type", "Message", "Locations"];

  const rows: string[][] = report.issues.map((issue: Issue) => [
    issue.variable,
    issue.severity,
    issue.type,
    issue.message,
    issue.locations.map((l) => `${l.file}:${l.line ?? 0}`).join(", ") || "-",
  ]);

  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => Math.min(r[i].length, 40)))
  );

  const lines: string[] = [];
  lines.push(buildSeparator(colWidths));
  lines.push(buildRow(headers, colWidths));
  lines.push(buildSeparator(colWidths));
  for (const row of rows) {
    lines.push(buildRow(row, colWidths));
  }
  lines.push(buildSeparator(colWidths));
  lines.push("");
  lines.push(
    `Summary: ${report.summary.totalIssues} issue(s) — ` +
      `${report.summary.errors} error(s), ` +
      `${report.summary.warnings} warning(s), ` +
      `${report.summary.infos} info(s)`
  );

  return lines.join("\n");
}
