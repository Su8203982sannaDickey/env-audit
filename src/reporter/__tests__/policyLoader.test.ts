import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { loadPolicy } from "../policyLoader";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "env-audit-policy-"));
}

describe("loadPolicy", () => {
  it("returns undefined when no policy file exists", () => {
    const dir = makeTempDir();
    expect(loadPolicy(dir)).toBeUndefined();
  });

  it("loads default policy file from directory", () => {
    const dir = makeTempDir();
    const policy = {
      rules: [
        { variable: "DB_URL", required: true },
        { variable: "API_KEY", required: false, allowedSeverities: ["warning"] },
      ],
    };
    fs.writeFileSync(path.join(dir, ".env-audit-policy.json"), JSON.stringify(policy));
    const result = loadPolicy(dir);
    expect(result).toBeDefined();
    expect(result!.rules).toHaveLength(2);
    expect(result!.rules[0].variable).toBe("DB_URL");
    expect(result!.rules[0].required).toBe(true);
  });

  it("loads explicit policy file path", () => {
    const dir = makeTempDir();
    const filePath = path.join(dir, "custom-policy.json");
    fs.writeFileSync(filePath, JSON.stringify({ rules: [{ variable: "FOO", required: true }] }));
    const result = loadPolicy(dir, filePath);
    expect(result).toBeDefined();
    expect(result!.rules[0].variable).toBe("FOO");
  });

  it("returns undefined and warns on invalid JSON", () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, ".env-audit-policy.json"), "not-json");
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = loadPolicy(dir);
    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("handles strict flag", () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, ".env-audit-policy.json"),
      JSON.stringify({ strict: true, rules: [] })
    );
    const result = loadPolicy(dir);
    expect(result!.strict).toBe(true);
  });

  it("skips entries with missing variable field", () => {
    const dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, ".env-audit-policy.json"),
      JSON.stringify({ rules: [{ required: true }, { variable: "VALID", required: false }] })
    );
    const result = loadPolicy(dir);
    expect(result!.rules).toHaveLength(1);
    expect(result!.rules[0].variable).toBe("VALID");
  });

  it("returns undefined when explicit policy file path does not exist", () => {
    const dir = makeTempDir();
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = loadPolicy(dir, path.join(dir, "nonexistent.json"));
    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
