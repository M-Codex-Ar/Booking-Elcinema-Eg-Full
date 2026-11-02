# scripts/

Repeatable developer commands, shipped in bash and PowerShell pairs so the same
steps work on a POSIX shell and on Windows without translation by hand.

| Script | Does | CI equivalent |
| --- | --- | --- |
| `setup.sh` / `setup.ps1` | Checks the toolchain, installs `elcinema/` dependencies, creates `elcinema/.env` from `.env.example` when missing, restores the API only if it has code | — |
| `dev.sh` / `dev.ps1` | Starts the Vite dev server (`--with-api` / `-WithApi` also runs the API once it exists) | — |
| `check.sh` / `check.ps1` | Format check, ESLint, `tsc --noEmit`, Vitest, production build, committed route-tree freshness | `Web CI` |

```sh
./scripts/setup.sh
./scripts/dev.sh
./scripts/check.sh          # or ./scripts/check.sh --all
```

```powershell
.\scripts\setup.ps1
.\scripts\dev.ps1
.\scripts\check.ps1         # or .\scripts\check.ps1 -All
```

Rules for this folder:

- Scripts are idempotent and safe to re-run; nothing here deletes work.
- Never print or copy the contents of `elcinema/.env` — only report whether it exists.
- A script must not silently skip a failing step; it collects failures and exits non-zero.
- Anything that becomes a one-off experiment belongs in a scratch directory, not here (see `.gitignore`).
