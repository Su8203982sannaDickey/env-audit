export type Severity = 'error' | 'warning' | 'info';

export interface ReportIssue {
  type: 'missing' | 'duplicate' | 'undocumented' | 'unused';
  severity: Severity;
  variable: string;
  message: string;
  locations?: string[];
}

export interface ReportSummary {
  totalVariables: number;
  totalIssues: number;
  errors: number;
  warnings: number;
  infos: number;
}

export interface AuditReport {
  timestamp: string;
  projectRoot: string;
  issues: ReportIssue[];
  summary: ReportSummary;
}
