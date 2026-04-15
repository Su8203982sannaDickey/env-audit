import { Report, Issue } from "./types";

export interface PolicyRule {
  variable: string;
  required: boolean;
  allowedSeverities?: string[];
  description?: string;
}

export interface PolicyConfig {
  rules: PolicyRule[];
  strict?: boolean;
}

function evaluateRule(rule: PolicyRule, issues: Issue[]): string[] {
  const violations: string[] = [];
  const relatedIssues = issues.filter((i) => i.variable === rule.variable);

  if (rule.required && relatedIssues.some((i) => i.type === "missing")) {
    violations.push(
      `POLICY VIOLATION: "${rule.variable}" is required but missing`
    );
  }

  if (rule.allowedSeverities) {
    for (const issue of relatedIssues) {
      if (!rule.allowedSeverities.includes(issue.severity)) {
        violations.push(
          `POLICY VIOLATION: "${rule.variable}" has disallowed severity "${issue.severity}"`
        );
      }
    }
  }

  return violations;
}

export function formatPolicy(report: Report, policy?: PolicyConfig): string {
  const lines: string[] = ["# Policy Audit Report", ""];

  if (!policy || policy.rules.length === 0) {
    lines.push("No policy rules configured.");
    return lines.join("\n");
  }

  const allViolations: string[] = [];

  for (const rule of policy.rules) {
    const violations = evaluateRule(rule, report.issues);
    allViolations.push(...violations);
  }

  if (allViolations.length === 0) {
    lines.push("✅ All policy rules passed.");
  } else {
    lines.push(`❌ ${allViolations.length} policy violation(s) found:`, "");
    for (const v of allViolations) {
      lines.push(`  - ${v}`);
    }
  }

  lines.push("");
  lines.push(
    `Summary: ${report.issues.length} total issue(s), ${allViolations.length} policy violation(s).`
  );

  return lines.join("\n");
}
