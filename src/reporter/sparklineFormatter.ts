import { Report } from "./types";

const SPARK_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

export function buildSparkline(values: number[]): string {
  if (values.length === 0) return "";
  const max = Math.max(...values);
  if (max === 0) return values.map(() => SPARK_CHARS[0]).join("");
  return values
    .map((v) => {
      const index = Math.round((v / max) * (SPARK_CHARS.length - 1));
      return SPARK_CHARS[index];
    })
    .join("");
}

function countBySeverity(
  report: Report
): { errors: number; warnings: number; infos: number } {
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  for (const issue of report.issues) {
    if (issue.severity === "error") errors++;
    else if (issue.severity === "warning") warnings++;
    else infos++;
  }
  return { errors, warnings, infos };
}

function countByType(
  report: Report
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const issue of report.issues) {
    counts[issue.type] = (counts[issue.type] ?? 0) + 1;
  }
  return counts;
}

export function formatSparkline(report: Report): string {
  const { errors, warnings, infos } = countBySeverity(report);
  const severitySpark = buildSparkline([errors, warnings, infos]);

  const typeCounts = countByType(report);
  const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const typeLines = typeEntries
    .map(([type, count]) => `  ${type.padEnd(16)} ${buildSparkline([count])} (${count})`)
    .join("\n");

  const lines = [
    "env-audit sparkline summary",
    "----------------------------",
    `Severity distribution:`,
    `  errors(${errors}) warnings(${warnings}) infos(${infos})`,
    `  ${severitySpark}`,
    "",
    "Issues by type:",
    typeLines || "  (none)",
    "",
    `Total: ${report.issues.length} issue(s)`,
    "",
  ];

  return lines.join("\n");
}
