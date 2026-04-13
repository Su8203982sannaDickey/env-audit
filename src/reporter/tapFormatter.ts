import { Report, Issue } from "./types";

function escapeComment(str: string): string {
  return str.replace(/[\r\n]/g, " ");
}

function issueToTapLine(issue: Issue, index: number): string {
  const ok = issue.severity === "info" ? "ok" : "not ok";
  const desc = escapeComment(`${issue.variable} — ${issue.message}`);
  const lines: string[] = [`${ok} ${index} - ${desc}`];
  lines.push(`  ---`);
  lines.push(`  severity: ${issue.severity}`);
  lines.push(`  type: ${issue.type}`);
  if (issue.locations && issue.locations.length > 0) {
    lines.push(`  locations:`);
    for (const loc of issue.locations) {
      lines.push(`    - file: ${loc.file}`);
      if (loc.line !== undefined) {
        lines.push(`      line: ${loc.line}`);
      }
    }
  }
  lines.push(`  ...`);
  return lines.join("\n");
}

export function formatTap(report: Report): string {
  const total = report.issues.length;
  const output: string[] = [];

  output.push("TAP version 13");
  output.push(`1..${total}`);
  output.push(`# env-audit scan: ${report.scannedDir}`);
  output.push(`# generated: ${report.generatedAt}`);

  if (total === 0) {
    output.push("# No issues found.");
  } else {
    report.issues.forEach((issue, i) => {
      output.push(issueToTapLine(issue, i + 1));
    });
  }

  output.push(
    `# summary: ${report.summary.errors} error(s), ` +
    `${report.summary.warnings} warning(s), ` +
    `${report.summary.infos} info(s)`
  );

  return output.join("\n") + "\n";
}
