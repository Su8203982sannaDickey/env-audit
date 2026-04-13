import { Report, Issue } from './types';

interface SarifLocation {
  physicalLocation: {
    artifactLocation: { uri: string };
    region?: { startLine: number };
  };
}

interface SarifResult {
  ruleId: string;
  level: 'error' | 'warning' | 'note';
  message: { text: string };
  locations: SarifLocation[];
}

function severityToLevel(severity: Issue['severity']): 'error' | 'warning' | 'note' {
  switch (severity) {
    case 'error': return 'error';
    case 'warning': return 'warning';
    case 'info': return 'note';
    default: return 'note';
  }
}

function issueToSarifResult(issue: Issue): SarifResult {
  const locations: SarifLocation[] = issue.locations && issue.locations.length > 0
    ? issue.locations.map(loc => ({
        physicalLocation: {
          artifactLocation: { uri: loc.file },
          region: loc.line !== undefined ? { startLine: loc.line } : undefined,
        },
      }))
    : [{ physicalLocation: { artifactLocation: { uri: 'unknown' } } }];

  return {
    ruleId: issue.type,
    level: severityToLevel(issue.severity),
    message: { text: issue.message },
    locations,
  };
}

export function formatSarif(report: Report): string {
  const results: SarifResult[] = report.issues.map(issueToSarifResult);

  const sarif = {
    $schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'env-audit',
            version: '1.0.0',
            informationUri: 'https://github.com/env-audit/env-audit',
            rules: [
              { id: 'missing', name: 'MissingEnvVariable', shortDescription: { text: 'Environment variable used in code but not defined in .env files.' } },
              { id: 'duplicate', name: 'DuplicateEnvVariable', shortDescription: { text: 'Environment variable defined more than once.' } },
              { id: 'undocumented', name: 'UndocumentedEnvVariable', shortDescription: { text: 'Environment variable defined in .env but not used in source code.' } },
            ],
          },
        },
        results,
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}
