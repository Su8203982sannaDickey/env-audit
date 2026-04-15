import { Report } from "./types";
import { computeMetrics } from "./metricsFormatter";

export type ScoreGrade = "A" | "B" | "C" | "D" | "F";

export interface Score {
  value: number; // 0–100
  grade: ScoreGrade;
  label: string;
}

const GRADE_THRESHOLDS: Array<[number, ScoreGrade, string]> = [
  [90, "A", "Excellent"],
  [75, "B", "Good"],
  [55, "C", "Fair"],
  [35, "D", "Poor"],
  [0, "F", "Critical"],
];

export function computeScore(report: Report): Score {
  const m = computeMetrics(report);

  if (m.totalIssues === 0) {
    return { value: 100, grade: "A", label: "Excellent" };
  }

  const errorPenalty = m.errorCount * 10;
  const warningPenalty = m.warningCount * 4;
  const infoPenalty = m.infoCount * 1;

  const raw = 100 - errorPenalty - warningPenalty - infoPenalty;
  const value = Math.max(0, Math.min(100, raw));

  const [, grade, label] =
    GRADE_THRESHOLDS.find(([threshold]) => value >= threshold) ??
    GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1];

  return { value, grade, label };
}

export function formatScore(report: Report): string {
  const score = computeScore(report);
  const bar = "#".repeat(Math.round(score.value / 5)).padEnd(20, "-");

  const lines = [
    "env-audit Health Score",
    "======================",
    `Score : ${score.value}/100`,
    `Grade : ${score.grade} (${score.label})`,
    `       [${bar}]`,
  ];

  return lines.join("\n") + "\n";
}
