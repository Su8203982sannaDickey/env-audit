import { Report, Issue } from './types';

export interface ChangeEntry {
  variable: string;
  changeType: 'added' | 'removed' | 'changed';
  severity: string;
  detail: string;
}

export function diffIssues(prev: Issue[], curr: Issue[]): ChangeEntry[] {
  const entries: ChangeEntry[] = [];

  const prevMap = new Map(prev.map(i => [i.variable, i]));
  const currMap = new Map(curr.map(i => [i.variable, i]));

  for (const [key, issue] of currMap) {
    if (!prevMap.has(key)) {
      entries.push({ variable: key, changeType: 'added', severity: issue.severity, detail: issue.message });
    } else {
      const old = prevMap.get(key)!;
      if (old.severity !== issue.severity || old.message !== issue.message) {
        entries.push({ variable: key, changeType: 'changed', severity: issue.severity, detail: `${old.severity} → ${issue.severity}` });
      }
    }
  }

  for (const [key, issue] of prevMap) {
    if (!currMap.has(key)) {
      entries.push({ variable: key, changeType: 'removed', severity: issue.severity, detail: issue.message });
    }
  }

  return entries;
}

function changeSymbol(type: ChangeEntry['changeType']): string {
  return type === 'added' ? '+' : type === 'removed' ? '-' : '~';
}

export function formatChanges(prev: Report, curr: Report): string {
  const changes = diffIssues(prev.issues, curr.issues);
  if (changes.length === 0) return 'No changes detected.\n';

  const lines: string[] = ['Changes Report', '==============', ''];
  for (const c of changes) {
    lines.push(`[${changeSymbol(c.changeType)}] ${c.variable} (${c.severity}): ${c.detail}`);
  }
  lines.push('');
  lines.push(`Total changes: ${changes.length}`);
  return lines.join('\n');
}
