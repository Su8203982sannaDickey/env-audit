import { Report, Issue } from "./types";

/**
 * Escapes a field value for TSV output.
 * Replaces tabs and newlines to keep each record on one line.
 */
export function escapeTsvField(value: string): string {
  return value
    .replace(/\t/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/\r/g, " ");
}

/**
 * Formats an array of location strings into a single TSV-safe cell.
 */
export function formatLocations(locations: Issue["locations"]): string {
  if (!locations || locations.length === 0) return "";
  return locations
    .map((loc) => `${loc.file}:${loc.line}`)
    .join("; ");
}

/**
 * Converts a single Issue into a TSV row string.
 */
export function formatIssueRow(issue: Issue): string {
  const fields = [
    escapeTsvField(issue.variable),
    escapeTsvField(issue.severity),
    escapeTsvField(issue.type),
    escapeTsvField(issue.message),
    escapeTsvField(formatLocations(issue.locations)),
  ];
  return fields.join("\t");
}

/**
 * Formats a full Report as a TSV string with a header row.
 */
export function formatTsv(report: Report): string {
  const header = ["variable", "severity", "type", "message", "locations"].join(
    "\t"
  );
  const rows = report.issues.map(formatIssueRow);
  return [header, ...rows].join("\n") + "\n";
}
