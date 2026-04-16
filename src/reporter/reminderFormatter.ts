import { Report, Issue } from './types';

function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function staleness(issue: Issue): string {
  if (!issue.firstSeen) return 'unknown';
  const days = daysSince(issue.firstSeen);
  if (days >= 30) return 'stale';
  if (days >= 7) return 'aging';
  return 'fresh';
}

function formatReminderLine(issue: Issue): string {
  const age = issue.firstSeen ? `${daysSince(issue.firstSeen)}d ago` : 'unknown age';
  const status = staleness(issue);
  const badge = status === 'stale' ? '[STALE]' : status === 'aging' ? '[AGING]' : '[  OK ]';
  return `${badge} ${issue.variable.padEnd(30)} ${issue.type.padEnd(14)} seen: ${age}`;
}

export function formatReminder(report: Report): string {
  const lines: string[] = [
    '# Reminder Report — Unresolved Issues by Age',
    `Generated: ${new Date().toISOString()}`,
    '',
    `${'Status'.padEnd(8)} ${'Variable'.padEnd(30)} ${'Type'.padEnd(14)} Age`,
    '-'.repeat(72),
  ];

  const sorted = [...report.issues].sort((a, b) => {
    const da = a.firstSeen ? daysSince(a.firstSeen) : 0;
    const db = b.firstSeen ? daysSince(b.firstSeen) : 0;
    return db - da;
  });

  for (const issue of sorted) {
    lines.push(formatReminderLine(issue));
  }

  lines.push('');
  const staleCount = sorted.filter(i => staleness(i) === 'stale').length;
  const agingCount = sorted.filter(i => staleness(i) === 'aging').length;
  lines.push(`Summary: ${staleCount} stale, ${agingCount} aging, ${sorted.length - staleCount - agingCount} fresh`);

  return lines.join('\n');
}
