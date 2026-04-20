import * as fs from "fs";
import * as path from "path";
import { AuditLogEntry } from "./auditLogFormatter";

export interface AuditLogStore {
  entries: AuditLogEntry[];
}

export function emptyStore(): AuditLogStore {
  return { entries: [] };
}

export function loadAuditLog(filePath: string): AuditLogStore {
  if (!fs.existsSync(filePath)) {
    return emptyStore();
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.entries)) {
      return parsed as AuditLogStore;
    }
    return emptyStore();
  } catch {
    return emptyStore();
  }
}

export function saveAuditLog(filePath: string, store: AuditLogStore): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
}

export function appendAuditEntry(
  store: AuditLogStore,
  entry: AuditLogEntry,
  maxEntries = 100
): AuditLogStore {
  const updated = [...store.entries, entry];
  return {
    entries: updated.length > maxEntries ? updated.slice(-maxEntries) : updated,
  };
}
