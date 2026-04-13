import { Report } from './types';

interface JsonOutput {
  summary: {
    totalIssues: number;
    missingCount: number;
    duplicateCount: number;
    undocumentedCount: number;
    scannedAt: string;
  };
  issues: Array<{
    type: string;
    severity: string;
    variable: string;
    message: string;
    locations: string[];
  }>;
}

export function formatJson(report: Report): string {
  const missing = report.issues.filter((i) => i.type === 'missing');
  const duplicate = report.issues.filter((i) => i.type === 'duplicate');
  const undocumented = report.issues.filter((i) => i.type === 'undocumented');

  const output: JsonOutput = {
    summary: {
      totalIssues: report.issues.length,
      missingCount: missing.length,
      duplicateCount: duplicate.length,
      undocumentedCount: undocumented.length,
      scannedAt: new Date().toISOString(),
    },
    issues: report.issues.map((issue) => ({
      type: issue.type,
      severity: issue.severity,
      variable: issue.variable,
      message: issue.message,
      locations: issue.locations ?? [],
    })),
  };

  return JSON.stringify(output, null, 2);
}
