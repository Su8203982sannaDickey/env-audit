import { Report, Issue } from "./types";

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatLocations(issue: Issue): string {
  if (!issue.locations || issue.locations.length === 0) return "";
  return issue.locations
    .map((loc) => `${loc.file}:${loc.line ??)
    .join(", ");
}

function issueToTestCase(issue: Issue, className: string): string {
  const name = esc[${issue.severity.toUpperCase()}] ${issue.variable} - ${issue.message}`);
  const locations = formatLocations(issue);
  const details = locations ? `Location(s): ${locations}` : "No location info";

  return [
    `    <testcase name="${name}" classname="${escapeXmlAttr(className)}">`,
    `      <failure message="${escapeXmlAttr(issue.message)}" type="${escapeXmlAttr(issue.type)}">`,
    `        ${escapeXmlAttr(details)}`,
    `      </failure>`,
    `    </testcase>`,
  ].join("\n");
}

export function formatJunit(report: Report): string {
  const className = "env-audit";
  const issues = report.issues;
  const failures = issues.length;
  const timestamp = new Date().toISOString();

  const testCases = issues.map((issue) => issueToTestCase(issue, className)).join("\n");

  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<testsuites name="env-audit" tests="${failures}" failures="${failures}" errors="0" time="0">`,
    `  <testsuite name="${escapeXmlAttr(className)}" tests="${failures}" failures="${failures}" errors="0" skipped="0" timestamp="${timestamp}">`,
    testCases,
    `  </testsuite>`,
    `</testsuites>`,
  ];

  return lines.join("\n");
}
