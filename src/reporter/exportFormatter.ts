import { Report } from "./types";

export interface ExportManifestEntry {
  format: string;
  path: string;
  size: number;
  generatedAt: string;
}

export interface ExportManifest {
  projectDir: string;
  generatedAt: string;
  totalIssues: number;
  exports: ExportManifestEntry[];
}

export function buildManifestEntry(
  format: string,
  path: string,
  content: string
): ExportManifestEntry {
  return {
    format,
    path,
    size: Buffer.byteLength(content, "utf8"),
    generatedAt: new Date().toISOString(),
  };
}

export function formatExport(
  report: Report,
  projectDir: string,
  entries: ExportManifestEntry[]
): string {
  const manifest: ExportManifest = {
    projectDir,
    generatedAt: new Date().toISOString(),
    totalIssues: report.issues.length,
    exports: entries,
  };
  return JSON.stringify(manifest, null, 2);
}

export function formatExportSummary(
  manifest: ExportManifest
): string {
  const lines: string[] = [
    `Export Manifest`,
    `  Project : ${manifest.projectDir}`,
    `  Generated: ${manifest.generatedAt}`,
    `  Total Issues: ${manifest.totalIssues}`,
    `  Exports (${manifest.exports.length}):`,
  ];
  for (const entry of manifest.exports) {
    lines.push(
      `    [${entry.format.toUpperCase()}] ${entry.path} (${entry.size} bytes)`
    );
  }
  return lines.join("\n");
}
