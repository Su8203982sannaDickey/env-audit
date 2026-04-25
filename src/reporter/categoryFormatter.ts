import { Report, Issue } from "./types";

type Category = "auth" | "database" | "network" | "storage" | "observability" | "other";

const CATEGORY_PATTERNS: Record<Category, RegExp> = {
  auth: /AUTH|TOKEN|SECRET|KEY|PASSWORD|PASS|CREDENTIAL|JWT|OAUTH|API_KEY/i,
  database: /DB|DATABASE|MONGO|POSTGRES|MYSQL|REDIS|SQLITE|DSN|CONNECTION/i,
  network: /HOST|PORT|URL|ENDPOINT|PROXY|CORS|DOMAIN|BASE_URL|API_URL/i,
  storage: /BUCKET|S3|STORAGE|UPLOAD|CDN|BLOB|FILE|PATH|DIR/i,
  observability: /LOG|TRACE|METRIC|SENTRY|DATADOG|NEWRELIC|DEBUG|VERBOSE|OTEL/i,
  other: /.*/,
};

export function categorizeIssue(issue: Issue): Category {
  const name = issue.variable ?? "";
  for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS) as [Category, RegExp][]) {
    if (category !== "other" && pattern.test(name)) {
      return category;
    }
  }
  return "other";
}

export function groupByCategory(issues: Issue[]): Map<Category, Issue[]> {
  const map = new Map<Category, Issue[]>();
  for (const issue of issues) {
    const cat = categorizeIssue(issue);
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(issue);
  }
  return map;
}

function formatCategorySection(category: Category, issues: Issue[]): string {
  const lines: string[] = [];
  const label = category.toUpperCase();
  lines.push(`[${label}] (${issues.length} issue${issues.length !== 1 ? "s" : ""})`);
  for (const issue of issues) {
    const loc = issue.locations?.map((l) => `${l.file}:${l.line ?? "?"}`).join(", ") ?? "unknown";
    lines.push(`  - [${issue.severity}] ${issue.type}: ${issue.variable ?? "(unnamed)"} @ ${loc}`);
  }
  return lines.join("\n");
}

export function formatCategory(report: Report): string {
  if (report.issues.length === 0) {
    return "No issues found.\n";
  }

  const grouped = groupByCategory(report.issues);
  const sections: string[] = [];

  const order: Category[] = ["auth", "database", "network", "storage", "observability", "other"];
  for (const cat of order) {
    const issues = grouped.get(cat);
    if (issues && issues.length > 0) {
      sections.push(formatCategorySection(cat, issues));
    }
  }

  const total = report.issues.length;
  sections.push(`\nTotal: ${total} issue${total !== 1 ? "s" : ""} across ${grouped.size} categor${grouped.size !== 1 ? "ies" : "y"}.`);

  return sections.join("\n\n") + "\n";
}
