import * as fs from "fs";
import * as path from "path";
import { WatchSnapshot } from "./watchFormatter";

const DEFAULT_STORE_FILE = ".env-audit-watch.json";

export interface WatchStore {
  snapshots: WatchSnapshot[];
  lastFingerprints: string[];
}

function emptyStore(): WatchStore {
  return { snapshots: [], lastFingerprints: [] };
}

export function loadWatchStore(dir: string = process.cwd()): WatchStore {
  const filePath = path.join(dir, DEFAULT_STORE_FILE);
  if (!fs.existsSync(filePath)) {
    return emptyStore();
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as WatchStore;
    if (!Array.isArray(parsed.snapshots) || !Array.isArray(parsed.lastFingerprints)) {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

export function saveWatchStore(
  store: WatchStore,
  dir: string = process.cwd()
): void {
  const filePath = path.join(dir, DEFAULT_STORE_FILE);
  // Keep only last 50 snapshots
  if (store.snapshots.length > 50) {
    store.snapshots = store.snapshots.slice(-50);
  }
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
}

export function appendSnapshot(
  store: WatchStore,
  snapshot: WatchSnapshot,
  fingerprints: string[]
): WatchStore {
  return {
    snapshots: [...store.snapshots, snapshot],
    lastFingerprints: fingerprints,
  };
}
