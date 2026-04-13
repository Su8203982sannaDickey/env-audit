export type Severity = "error" | "warning" | "info";

export interface Location {
  file: string;
  line?: number;
  column?: number;
}

export interface Issue {
  rule: string;
  severity: Severity;
  message: string;
  variable: string;
  locations: Location[];
}

export interface Summary {
  totalIssues: number;
  errors: number;
  warnings: number;
  infos: number;
}

export interface Report {
  issues: Issue[];
  summary: Summary;
}
