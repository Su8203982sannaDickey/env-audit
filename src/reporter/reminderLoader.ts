import * as fs from 'fs';
import * as path from 'path';

export interface ReminderConfig {
  staleAfterDays: number;
  agingAfterDays: number;
  includeTypes: string[];
}

const DEFAULTS: ReminderConfig = {
  staleAfterDays: 30,
  agingAfterDays: 7,
  includeTypes: ['missing', 'duplicate', 'undocumented'],
};

function mergeConfig(base: ReminderConfig, overrides: Partial<ReminderConfig>): ReminderConfig {
  return {
    staleAfterDays: overrides.staleAfterDays ?? base.staleAfterDays,
    agingAfterDays: overrides.agingAfterDays ?? base.agingAfterDays,
    includeTypes: overrides.includeTypes ?? base.includeTypes,
  };
}

export function loadReminderConfig(configPath?: string): ReminderConfig {
  if (!configPath) return { ...DEFAULTS };
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) return { ...DEFAULTS };
  try {
    const raw = fs.readFileSync(resolved, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<ReminderConfig>;
    return mergeConfig(DEFAULTS, parsed);
  } catch {
    return { ...DEFAULTS };
  }
}
