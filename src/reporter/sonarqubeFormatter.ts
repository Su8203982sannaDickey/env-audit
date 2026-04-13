import { Report, Issue } from "./types";

interface SonarIssue {
  engineId: string;
  ruleId: string;
  severity: string;
  type: string;
  primaryLocation: {
    message: string;
    filePath: string;
    textRange?: {
      startLine: number;
      endLine: number;
      startColumn: number;
      endColumn: number;
    };
  };
  secondaryLocations?: Array<{
    message: string;
    filePath: string;
  }>;
}

function severityToSonar(severity: Issue["severity"]): string {
  switch (severity) {
    case "error":
      return "CRITICAL";
    case "warning":
      return "MAJOR";
    case "info":
      return "MINOR";
    default:
      return "INFO";
  }
}

function issueToSonarIssue(issue: Issue): SonarIssue {
  const primaryLocation = issue.locations?.[0];
  const filePath = primaryLocation?.file ?? "unknown";
  const line = primaryLocation?.line ?? 1;

  const sonarIssue: SonarIssue = {
    engineId: "env-audit",
    ruleId: issue.type,
    severity: severityToSonar(issue.severity),
    type: issue.severity === "error" ? "BUG" : "CODE_SMELL",
    primaryLocation: {
      message: issue.message,
      filePath,
      textRange: {
        startLine: line,
        endLine: line,
        startColumn: 0,
        endColumn: 80,
      },
    },
  };

  const secondary = (issue.locations ?? []).slice(1);
  if (secondary.length > 0) {
    sonarIssue.secondaryLocations = secondary.map((loc) => ({
      message: `Also referenced in ${loc.file}`,
      filePath: loc.file,
    }));
  }

  return sonarIssue;
}

export function formatSonarqube(report: Report): string {
  const issues = report.issues.map(issueToSonarIssue);
  return JSON.stringify({ issues }, null, 2);
}
