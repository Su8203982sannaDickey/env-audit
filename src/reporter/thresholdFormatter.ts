import { Report, Issue } from "./types";

export interface ThresholdConfig {
  maxErrors?: number;
  maxWarnings?: number;
  maxInfos?: number;
  maxTotal?: number;
}

export interface ThresholdResult {
  passed: boolean;
  violations: string[];
  counts: { error: number; warning: number; info: number; total: number };
}

export function countBySeverity(
  issues: Issue[]
): { error: number; warning: number; info: number } {
  return issues.reduce(
    (acc, issue) => {
      const sev = issue.severity ?? "info";
      if (sev === "error") acc.error++;
      else if (sev === "warning") acc.warning++;
      else acc.info++;
      return acc;
    },
    { error: 0, warning: 0, info: 0 }
  );
}

export function evaluateThresholds(
  issues: Issue[],
  config: ThresholdConfig
): ThresholdResult {
  const counts = countBySeverity(issues);
  const total = counts.error + counts.warning + counts.info;
  const violations: string[] = [];

  if (config.maxErrors !== undefined && counts.error > config.maxErrors) {
    violations.push(
      `Error count ${counts.error} exceeds threshold ${config.maxErrors}`
    );
  }
  if (config.maxWarnings !== undefined && counts.warning > config.maxWarnings) {
    violations.push(
      `Warning count ${counts.warning} exceeds threshold ${config.maxWarnings}`
    );
  }
  if (config.maxInfos !== undefined && counts.info > config.maxInfos) {
    violations.push(
      `Info count ${counts.info} exceeds threshold ${config.maxInfos}`
    );
  }
  if (config.maxTotal !== undefined && total > config.maxTotal) {
    violations.push(
      `Total issue count ${total} exceeds threshold ${config.maxTotal}`
    );
  }

  return { passed: violations.length === 0, violations, counts: { ...counts, total } };
}

export function formatThreshold(
  report: Report,
  config: ThresholdConfig = {}
): string {
  const result = evaluateThresholds(report.issues, config);
  const lines: string[] = [];

  lines.push("=== Threshold Check ===");
  lines.push(
    `Counts — error: ${result.counts.error}, warning: ${result.counts.warning}, info: ${result.counts.info}, total: ${result.counts.total}`
  );

  if (result.passed) {
    lines.push("Status: PASSED — all thresholds satisfied");
  } else {
    lines.push("Status: FAILED");
    result.violations.forEach((v) => lines.push(`  ✖ ${v}`));
  }

  return lines.join("\n") + "\n";
}
