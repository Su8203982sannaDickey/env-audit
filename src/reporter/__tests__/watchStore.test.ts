import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  loadWatchStore,
  saveWatchStore,
  appendSnapshot,
  WatchStore,
} from "../watchStore";
import { WatchSnapshot } from "../watchFormatter";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "watch-store-test-"));
}

function makeSnapshot(overrides: Partial<WatchSnapshot> = {}): WatchSnapshot {
  return {
    timestamp: new Date().toISOString(),
    totalIssues: 0,
    byType: {},
    bySeverity: {},
    newIssues: [],
    resolvedIssues: [],
    ...overrides,
  };
}

describe("loadWatchStore", () => {
  it("returns empty store when file does not exist", () => {
    const dir = makeTempDir();
    const store = loadWatchStore(dir);
    expect(store.snapshots).toEqual([]);
    expect(store.lastFingerprints).toEqual([]);
  });

  it("returns empty store for malformed JSON", () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, ".env-audit-watch.json"), "not-json");
    const store = loadWatchStore(dir);
    expect(store.snapshots).toEqual([]);
  });

  it("loads a valid store from disk", () => {
    const dir = makeTempDir();
    const data: WatchStore = {
      snapshots: [makeSnapshot({ totalIssues: 3 })],
      lastFingerprints: ["missing:KEY:error"],
    };
    fs.writeFileSync(
      path.join(dir, ".env-audit-watch.json"),
      JSON.stringify(data)
    );
    const store = loadWatchStore(dir);
    expect(store.snapshots).toHaveLength(1);
    expect(store.lastFingerprints).toContain("missing:KEY:error");
  });
});

describe("saveWatchStore", () => {
  it("writes store to disk and caps at 50 snapshots", () => {
    const dir = makeTempDir();
    const snapshots = Array.from({ length: 55 }, (_, i) =>
      makeSnapshot({ totalIssues: i })
    );
    const store: WatchStore = { snapshots, lastFingerprints: [] };
    saveWatchStore(store, dir);
    const loaded = loadWatchStore(dir);
    expect(loaded.snapshots).toHaveLength(50);
    expect(loaded.snapshots[0].totalIssues).toBe(5);
  });
});

describe("appendSnapshot", () => {
  it("adds snapshot and updates fingerprints", () => {
    const store: WatchStore = { snapshots: [], lastFingerprints: [] };
    const snap = makeSnapshot({ totalIssues: 2 });
    const updated = appendSnapshot(store, snap, ["missing:A:error"]);
    expect(updated.snapshots).toHaveLength(1);
    expect(updated.lastFingerprints).toEqual(["missing:A:error"]);
  });

  it("does not mutate the original store", () => {
    const store: WatchStore = { snapshots: [], lastFingerprints: [] };
    appendSnapshot(store, makeSnapshot(), []);
    expect(store.snapshots).toHaveLength(0);
  });
});
