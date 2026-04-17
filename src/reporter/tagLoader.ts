import * as fs from 'fs';
import * as path from 'path';

export interface TagConfig {
  include?: string[];
  exclude?: string[];
  aliases?: Record<string, string>;
}

export function parseTagConfig(raw: string): TagConfig {
  const config: TagConfig = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('include:')) {
      config.include = trimmed.slice(8).split(',').map(s => s.trim()).filter(Boolean);
    } else if (trimmed.startsWith('exclude:')) {
      config.exclude = trimmed.slice(8).split(',').map(s => s.trim()).filter(Boolean);
    } else if (trimmed.startsWith('alias:')) {
      const rest = trimmed.slice(6).trim();
      const [from, to] = rest.split('=').map(s => s.trim());
      if (from && to) {
        if (!config.aliases) config.aliases = {};
        config.aliases[from] = to;
      }
    }
  }
  return config;
}

export function loadTagConfig(dir: string): TagConfig {
  const candidates = ['.env-audit-tags', 'env-audit-tags.conf'];
  for (const name of candidates) {
    const filePath = path.join(dir, name);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return parseTagConfig(raw);
    }
  }
  return {};
}

export function applyTagConfig(tags: string[], config: TagConfig): string[] {
  let result = [...tags];
  if (config.aliases) {
    result = result.map(t => config.aliases![t] ?? t);
  }
  if (config.include && config.include.length > 0) {
    result = result.filter(t => config.include!.includes(t));
  }
  if (config.exclude) {
    result = result.filter(t => !config.exclude!.includes(t));
  }
  return [...new Set(result)];
}
