export { scanFileForEnvUsage, scanDirectoryForEnvUsage, groupUsagesByVariable } from './sourceScanner';
export type { EnvUsage } from './sourceScanner';

import { scanDirectoryForEnvUsage, groupUsagesByVariable, EnvUsage } from './sourceScanner';
import { parseEnvFilesInDirectory } from '../parser';

export interface AuditResult {
  undocumented: string[];
  unused: string[];
  usages: Map<string, EnvUsage[]>;
}

/**
 * Cross-references env variables found in source code against .env files.
 * Returns undocumented variables (used in code but not in .env)
 * and unused variables (defined in .env but never referenced in code).
 */
export function auditEnvVariables(
  projectDir: string,
  sourceExtensions?: string[]
): AuditResult {
  const { keys: definedKeys } = parseEnvFilesInDirectory(projectDir);
  const usages = scanDirectoryForEnvUsage(projectDir, sourceExtensions);
  const usageMap = groupUsagesByVariable(usages);

  const referencedKeys = new Set(usageMap.keys());
  const definedSet = new Set(definedKeys);

  const undocumented = [...referencedKeys].filter(key => !definedSet.has(key));
  const unused = [...definedSet].filter(key => !referencedKeys.has(key));

  return {
    undocumented,
    unused,
    usages: usageMap,
  };
}
