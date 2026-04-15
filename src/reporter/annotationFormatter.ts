import { Report, Issue } from "./types";

type AnnotationLevel = "notice" | "warning" | "failure";

interface Annotation {
  level: AnnotationLevel;
  variable: string;
  type: string;
  message: string;
  locations: string[];
  severity: string;
}

function severityToLevel(severity: string): AnnotationLevel {
  switch (severity.toLowerCase()) {
    case "error":
      return "failure";
    case "warning":
      return "warning";
    default:
      return "notice";
  }
}

function issueToAnnotation(issue: Issue): Annotation {
  return {
    level: severityToLevel(issue.severity),
    variable: issue.variable,
    type: issue.type,
    message: issue.message,
    locations: issue.locations ?? [],
    severity: issue.severity,
  };
}

function formatAnnotationBlock(annotation: Annotation, index: number): string {
  const lines: string[] = [];
  lines.push(`[${index + 1}] [${annotation.level.toUpperCase()}] ${annotation.variable}`);
  lines.push(`  type     : ${annotation.type}`);
  lines.push(`  severity : ${annotation.severity}`);
  lines.push(`  message  : ${annotation.message}`);
  if (annotation.locations.length > 0) {
    lines.push(`  locations:`);
    annotation.locations.forEach((loc) => lines.push(`    - ${loc}`));
  }
  return lines.join("\n");
}

export function formatAnnotation(report: Report): string {
  if (report.issues.length === 0) {
    return "No issues found.\n";
  }

  const annotations = report.issues.map(issueToAnnotation);
  const blocks = annotations.map((a, i) => formatAnnotationBlock(a, i));

  const header = `Annotation Report — ${report.issues.length} issue(s) found`;
  const separator = "=".repeat(header.length);

  return [header, separator, ...blocks, ""].join("\n");
}
