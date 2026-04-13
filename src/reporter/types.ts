export type IssueSeverity = 'error' | 'warning' | 'info';

export type IssueKind = 'missing' | 'duplicate' | 'undocumented';

export interface Issue {
  kind: IssueKind;
  severity: IssueSeverity;
  variable: string;
  message: string;
  file?: string;
  line?: number;
}

export interface ReportSummary {
  scannedFiles: number;
  totalDefined: number;
  totalIssues: number;
  errors: number;
  warnings: number;
  infos: number;
}

export interface Report {
  summary: ReportSummary;
  issues: Issue[];
}
