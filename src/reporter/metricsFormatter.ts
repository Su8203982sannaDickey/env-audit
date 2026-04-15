import { Report, Issue } from "./types";

export interface Metrics {
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  affectedFiles: number;
  affectedVariables: number;
  issuesPerFile: number;
  errorRate: number;
}

export function computeMetrics(report: Report): Metrics {
  const { issues } = report;

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  const files = new Set<string>();
  for (const issue of issues) {
    for (const loc of issue.locations) {
      files.add(loc.file);
    }
  }

  const variables = new Set(issues.map((i) => i.variable));
  const affectedFiles = files.size;
  const totalIssues = issues.length;

  return {
    totalIssues,
    errorCount,
    warningCount,
    infoCount,
    affectedFiles,
    affectedVariables: variables.size,
    issuesPerFile: affectedFiles > 0 ? totalIssues / affectedFiles : 0,
    errorRate: totalIssues > 0 ? errorCount / totalIssues : 0,
  };
}

export function formatMetrics(report: Report): string {
  const m = computeMetrics(report);

  const lines = [
    "env-audit Metrics",
    "==================",
    `totalIssues       : ${m.totalIssues}`,
    `errorCount        : ${m.errorCount}`,
    `warningCount      : ${m.warningCount}`,
    `infoCount         : ${m.infoCount}`,
    `affectedFiles     : ${m.affectedFiles}`,
    `affectedVariables : ${m.affectedVariables}`,
    `issuesPerFile     : ${m.issuesPerFile.toFixed(2)}`,
    `errorRate         : ${(m.errorRate * 100).toFixed(1)}%`,
  ];

  return lines.join("\n") + "\n";
}
