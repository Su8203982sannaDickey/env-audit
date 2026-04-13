import { Report, Issue } from './types';

type BadgeStyle = 'flat' | 'flat-square' | 'plastic' | 'for-the-badge';

interface BadgeOptions {
  style?: BadgeStyle;
  label?: string;
}

function severityCount(issues: Issue[], severity: string): number {
  return issues.filter((i) => i.severity === severity).length;
}

function encodeBadgePart(value: string): string {
  return value.replace(/-/g, '--').replace(/_/g, '__').replace(/ /g, '_');
}

function buildShieldUrl(
  label: string,
  message: string,
  color: string,
  style: BadgeStyle
): string {
  const encodedLabel = encodeBadgePart(label);
  const encodedMessage = encodeBadgePart(message);
  return `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${color}?style=${style}`;
}

function statusColor(issueCount: number): string {
  if (issueCount === 0) return 'brightgreen';
  if (issueCount <= 3) return 'yellow';
  return 'red';
}

export function formatBadge(report: Report, options: BadgeOptions = {}): string {
  const style: BadgeStyle = options.style ?? 'flat';
  const label = options.label ?? 'env-audit';

  const total = report.issues.length;
  const errors = severityCount(report.issues, 'error');
  const warnings = severityCount(report.issues, 'warning');
  const infos = severityCount(report.issues, 'info');

  const statusBadgeUrl = buildShieldUrl(
    label,
    total === 0 ? 'passing' : `${total} issues`,
    statusColor(errors),
    style
  );

  const errorBadgeUrl = buildShieldUrl('errors', String(errors), errors > 0 ? 'red' : 'brightgreen', style);
  const warnBadgeUrl = buildShieldUrl('warnings', String(warnings), warnings > 0 ? 'yellow' : 'brightgreen', style);
  const infoBadgeUrl = buildShieldUrl('info', String(infos), 'blue', style);

  const lines: string[] = [
    '<!-- env-audit badges -->',
    `![env-audit status](${statusBadgeUrl})`,
    `![errors](${errorBadgeUrl})`,
    `![warnings](${warnBadgeUrl})`,
    `![info](${infoBadgeUrl})`,
  ];

  return lines.join('\n') + '\n';
}
