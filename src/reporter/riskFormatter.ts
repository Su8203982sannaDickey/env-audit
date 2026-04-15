import { Report, Issue } from "./types";

type RiskLevel = "critical" | "high" | "medium" | "low";

interface RiskEntry {
  variable: string;
  riskLevel: RiskLevel;
  score: number;
  reasons: string[];
}

function computeRiskScore(issue: Issue): number {
  let score = 0;
  if (issue.severity === "error") score += 40;
  else if (issue.severity === "warning") score += 20;
  else score += 5;

  if (issue.type === "missing") score += 30;
  else if (issue.type === "duplicate") score += 20;
  else if (issue.type === "undocumented") score += 10;

  if (issue.locations && issue.locations.length > 3) score += 10;
  return score;
}

function scoreToLevel(score: number): RiskLevel {
  if (score >= 70) return "critical";
  if (score >= 50) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function buildRiskEntry(issue: Issue): RiskEntry {
  const score = computeRiskScore(issue);
  const reasons: string[] = [];
  if (issue.severity === "error") reasons.push("severity: error");
  if (issue.type === "missing") reasons.push("variable is missing");
  if (issue.type === "duplicate") reasons.push("variable is duplicated");
  if (issue.type === "undocumented") reasons.push("variable is undocumented");
  if (issue.locations && issue.locations.length > 3)
    reasons.push(`referenced in ${issue.locations.length} locations`);
  return {
    variable: issue.variable,
    riskLevel: scoreToLevel(score),
    score,
    reasons,
  };
}

export function formatRisk(report: Report): string {
  const entries = report.issues
    .map(buildRiskEntry)
    .sort((a, b) => b.score - a.score);

  const lines: string[] = ["# Risk Assessment Report", ""];
  const levelOrder: RiskLevel[] = ["critical", "high", "medium", "low"];

  for (const level of levelOrder) {
    const group = entries.filter((e) => e.riskLevel === level);
    if (group.length === 0) continue;
    lines.push(`## ${level.toUpperCase()} (${group.length})`);
    for (const entry of group) {
      lines.push(`  [score: ${entry.score}] ${entry.variable}`);
      for (const reason of entry.reasons) {
        lines.push(`    - ${reason}`);
      }
    }
    lines.push("");
  }

  lines.push(
    `Total issues: ${report.issues.length} | Scanned: ${report.summary.scannedFiles} files`
  );
  return lines.join("\n");
}
