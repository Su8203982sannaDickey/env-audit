import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { buildAuditLogEntry, formatAuditLog } from "../auditLogFormatter";
import {
  emptyStore,
  loadAuditLog,
  saveAuditLog,
  appendAuditEntry,
} from "../auditLogStore";
import { Report, Issue } from "../types";

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    type: "missing",
    severity: "error",
    variable: "MY_VAR",
    message: "Missing variable",
    locations: [{ file: "src/app.ts", line: 10 }],
    ...overrides,
  };
}

function makeReport(issues: Issue[] = []): Report {
  return {
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("buildAuditLogEntry", () => {
  it("counts issues by severity and type", () => {
    const report = makeReport([
      makeIssue({ severity: "error", type: "missing" }),
      makeIssue({ severity: "warning", type: "duplicate" }),
      makeIssue({ severity: "error", type: "missing" }),
    ]);
    const entry = buildAuditLogEntry(report, "run-001", "2024-01-01T00:00:00.000Z");
    expect(entry.runId).toBe("run-001");
    expect(entry.totalIssues).toBe(3);
    expect(entry.bySeverity["error"]).toBe(2);
    expect(entry.bySeverity["warning"]).toBe(1);
    expect(entry.byType["missing"]).toBe(2);
    expect(entry.byType["duplicate"]).toBe(1);
  });

  it("includes top files sorted by frequency", () => {
    const report = makeReport([
      makeIssue({ locations: [{ file: "a.ts", line: 1 }] }),
      makeIssue({ locations: [{ file: "a.ts", line: 2 }] }),
      makeIssue({ locations: [{ file: "b.ts", line: 1 }] }),
    ]);
    const entry = buildAuditLogEntry(report, "run-002");
    expect(entry.topFiles[0].file).toBe("a.ts");
    expect(entry.topFiles[0].count).toBe(2);
  });
});

describe("formatAuditLog", () => {
  it("produces a structured log string", () => {
    const report = makeReport([makeIssue()]);
    const output = formatAuditLog(report, "run-abc");
    expect(output).toContain("run=run-abc");
    expect(output).toContain("total=1");
    expect(output).toContain("error=1");
    expect(output).toContain("missing=1");
  });
});

describe("auditLogStore", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "audit-log-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty store when file does not exist", () => {
    const store = loadAuditLog(path.join(tmpDir, "missing.json"));
    expect(store.entries).toHaveLength(0);
  });

  it("saves and reloads entries", () => {
    const filePath = path.join(tmpDir, "audit.json");
    const report = makeReport([makeIssue()]);
    const entry = buildAuditLogEntry(report, "r1", "2024-06-01T00:00:00.000Z");
    let store = appendAuditEntry(emptyStore(), entry);
    saveAuditLog(filePath, store);
    const loaded = loadAuditLog(filePath);
    expect(loaded.entries).toHaveLength(1);
    expect(loaded.entries[0].runId).toBe("r1");
  });

  it("caps entries at maxEntries", () => {
    let store = emptyStore();
    for (let i = 0; i < 5; i++) {
      const entry = buildAuditLogEntry(makeReport([makeIssue()]), `run-${i}`);
      store = appendAuditEntry(store, entry, 3);
    }
    expect(store.entries).toHaveLength(3);
    expect(store.entries[0].runId).toBe("run-2");
  });
});
