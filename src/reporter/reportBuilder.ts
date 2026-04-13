import { AuditReport, ReportIssue, ReportSummary } from './types';

export function buildSummary(issues: ReportIssue[]): ReportSummary {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  const infos = issues.filter((i) => i.severity === 'info').length;

  const uniqueVars = new Set(issues.map((i) => i.variable));

  return {
    totalVariables: uniqueVars.size,
    totalIssues: issues.length,
    errors,
    warnings,
    infos,
  };
}

export function buildReport(
  projectRoot: string,
  issues: ReportIssue[]
): AuditReport {
  return {
    timestamp: new Date().toISOString(),
    projectRoot,
    issues,
    summary: buildSummary(issues),
  };
}

export function issueFromMissing(variable: string, locations: string[]): ReportIssue {
  return {
    type: 'missing',
    severity: 'error',
    variable,
    message: `"${variable}" is used in source code but not defined in any .env file.`,
    locations,
  };
}

export function issueFromDuplicate(variable: string, locations: string[]): ReportIssue {
  return {
    type: 'duplicate',
    severity: 'warning',
    variable,
    message: `"${variable}" is defined multiple times across .env files.`,
    locations,
  };
}

export function issueFromUndocumented(variable: string): ReportIssue {
  return {
    type: 'undocumented',
    severity: 'info',
    variable,
    message: `"${variable}" is defined in .env but never referenced in source code.`,
  };
}
