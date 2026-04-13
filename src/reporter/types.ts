export type IssueSeverity = "error" | "warning" | "info";

export type IssueType = "missing" | "duplicate" | "undocumented";

export interface Location {
  file: string;
  line?: number;
}

export interface Issue {
  type: IssueType;
  severity: IssueSeverity;
  variable: string;
  message: string;
  locations?: Location[];
}

export interface Summary {
  total: number;
  errors: number;
  warnings: number;
  infos: number;
}

export interface Report {
  missing: Issue[];
  duplicates: Issue[];
  undocumented: Issue[];
  summary: Summary;
}
