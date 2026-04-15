import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parseIgnoreFile, loadIgnoreConfig } from "../ignoreLoader";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "env-audit-ignore-"));
}

describe("parseIgnoreFile", () => {
  it("parses variable names", () => {
    const config = parseIgnoreFile("SECRET_KEY\nAPI_URL\n");
    expect(config.rules).toHaveLength(2);
    expect(config.rules[0].variable).toBe("SECRET_KEY");
    expect(config.rules[1].variable).toBe("API_URL");
  });

  it("parses variable with reason", () => {
    const config = parseIgnoreFile("SECRET_KEY: not needed in CI\n");
    expect(config.rules[0].variable).toBe("SECRET_KEY");
    expect(config.rules[0].reason).toBe("not needed in CI");
  });

  it("skips comments and blank lines", () => {
    const content = "# this is a comment\n\nSECRET_KEY\n";
    const config = parseIgnoreFile(content);
    expect(config.rules).toHaveLength(1);
  });

  it("returns empty rules for empty content", () => {
    const config = parseIgnoreFile("");
    expect(config.rules).toHaveLength(0);
  });
});

describe("loadIgnoreConfig", () => {
  it("returns empty config if file does not exist", () => {
    const dir = makeTempDir();
    const config = loadIgnoreConfig(dir);
    expect(config.rules).toHaveLength(0);
  });

  it("loads and parses the ignore file", () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, ".envauditignore"), "DEBUG\nLEGACY_KEY: old var\n");
    const config = loadIgnoreConfig(dir);
    expect(config.rules).toHaveLength(2);
    expect(config.rules[1].reason).toBe("old var");
  });

  it("supports custom filename", () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, "custom.ignore"), "MY_VAR\n");
    const config = loadIgnoreConfig(dir, "custom.ignore");
    expect(config.rules[0].variable).toBe("MY_VAR");
  });
});
