import { Report, Issue } from "./types";

type FileSeverityMap = Record<string, { error: number; warn: number; info: number; total: number }>;

function buildHeatmap(issues: Issue[]): FileSeverityMap {
  const map: FileSeverityMap = {};
  for (const issue of issues) {
    const files = (issue.locations ?? []).map((l) => l.file);
    const targets = files.length > 0 ? files : ["(unknown)"];
    for (const file of targets) {
      if (!map[file]) map[file] = { error: 0, warn: 0, info: 0, total: 0 };
      map[file][issue.severity as "error" | "warn" | "info"]++;
      map[file].total++;
    }
  }
  return map;
}

function heatBar(count: number, max: number, width = 20): string {
  if (max === 0) return " ".repeat(width);
  const filled = Math.round((count / max) * width);
  return "█".repeat(filled).padEnd(width);
}

export function formatHeatmap(report: Report): string {
  const map = buildHeatmap(report.issues);
  const entries = Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  const maxTotal = entries.reduce((m, [, v]) => Math.max(m, v.total), 0);

  const lines: string[] = [];
  lines.push("# Env Audit — File Heatmap");
  lines.push("");
  lines.push(`  ${'File'.padEnd(40)} ${'Total'.padEnd(7)} ${'E'.padEnd(5)} ${'W'.padEnd(5)} ${'I'.padEnd(5)} Heat`);
  lines.push("  " + "-".repeat(85));

  for (const [file, counts] of entries) {
    const bar = heatBar(counts.total, maxTotal);
    lines.push(
      `  ${file.padEnd(40)} ${String(counts.total).padEnd(7)} ${String(counts.error).padEnd(5)} ${String(counts.warn).padEnd(5)} ${String(counts.info).padEnd(5)} ${bar}`
    );
  }

  if (entries.length === 0) {
    lines.push("  (no issues found)");
  }

  lines.push("");
  lines.push(`# ${entries.length} file(s) affected`);
  return lines.join("\n");
}
