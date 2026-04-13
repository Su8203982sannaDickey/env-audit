#!/usr/bin/env node

/**
 * env-audit entry point
 *
 * Wires together the CLI argument parser, directory scanner, and reporter
 * so the tool can be invoked directly from the command line or consumed
 * programmatically by other Node.js scripts.
 */

import * as path from "path";
import * as fs from "fs";
import { getDir, getFormat, getOutput } from "./cli/index";
import { parseEnvFilesInDirectory, findDuplicateKeys } from "./parser/index";
import { auditEnvVariables } from "./scanner/index";
import { buildReport } from "./reporter/reportBuilder";
import { formatOutput } from "./reporter/formatters";

async function main(): Promise<void> {
  const dir = getDir();
  const format = getFormat();
  const output = getOutput();

  const absoluteDir = path.resolve(dir);

  if (!fs.existsSync(absoluteDir)) {
    console.error(`[env-audit] Directory not found: ${absoluteDir}`);
    process.exit(1);
  }

  // ── 1. Parse all .env files found under the target directory ──────────────
  let envParseResult: Awaited<ReturnType<typeof parseEnvFilesInDirectory>>;
  try {
    envParseResult = await parseEnvFilesInDirectory(absoluteDir);
  } catch (err) {
    console.error("[env-audit] Failed to parse .env files:", err);
    process.exit(1);
  }

  const { entries: envEntries, files: envFiles } = envParseResult;

  // ── 2. Find duplicate keys across all parsed .env files ───────────────────
  const duplicates = findDuplicateKeys(envEntries);

  // ── 3. Scan source files for process.env usages ───────────────────────────
  let auditResult: Awaited<ReturnType<typeof auditEnvVariables>>;
  try {
    auditResult = await auditEnvVariables(absoluteDir, envEntries);
  } catch (err) {
    console.error("[env-audit] Failed to scan source files:", err);
    process.exit(1);
  }

  const { missing, undocumented, usages } = auditResult;

  // ── 4. Build the structured report ───────────────────────────────────────
  const report = buildReport({
    missing,
    duplicates,
    undocumented,
    usages,
    scannedFiles: envFiles,
  });

  // ── 5. Format and emit output ─────────────────────────────────────────────
  const formatted = formatOutput(report, format);

  if (output) {
    const outputPath = path.resolve(output);
    try {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, formatted, "utf-8");
      console.log(`[env-audit] Report written to ${outputPath}`);
    } catch (err) {
      console.error("[env-audit] Failed to write output file:", err);
      process.exit(1);
    }
  } else {
    process.stdout.write(formatted);
    // Ensure output ends with a newline when writing to stdout
    if (!formatted.endsWith("\n")) {
      process.stdout.write("\n");
    }
  }

  // ── 6. Exit with a non-zero code when actionable issues were found ─────────
  const hasIssues =
    report.summary.missing > 0 ||
    report.summary.duplicates > 0 ||
    report.summary.undocumented > 0;

  process.exit(hasIssues ? 1 : 0);
}

main();
