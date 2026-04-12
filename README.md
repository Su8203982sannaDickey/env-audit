# env-audit

> A CLI tool that scans project directories for missing, duplicate, or undocumented environment variables across `.env` files and source code.

---

## Installation

```bash
npm install -g env-audit
```

Or use it without installing:

```bash
npx env-audit
```

---

## Usage

Run the audit from the root of your project:

```bash
env-audit scan
```

**Example output:**

```
✔ Found .env, .env.example, src/
⚠ Missing in .env:        DATABASE_URL, STRIPE_SECRET_KEY
⚠ Undocumented (not in .env.example): JWT_SECRET
✔ No duplicates found

3 issue(s) detected.
```

### Options

| Flag | Description |
|------|-------------|
| `--dir <path>` | Target directory to scan (default: `.`) |
| `--ignore <glob>` | Glob pattern of files to ignore |
| `--strict` | Exit with non-zero code if issues are found |

```bash
env-audit scan --dir ./apps/api --strict
```

---

## How It Works

1. Parses all `.env*` files in the target directory
2. Scans source files (`.ts`, `.js`) for `process.env.*` references
3. Cross-references variables across files to detect missing, duplicate, or undocumented entries

---

## License

[MIT](./LICENSE)