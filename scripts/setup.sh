#!/usr/bin/env bash
# Install everything this repository needs, in the order it matters.
# Safe to re-run: every step is idempotent.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

say() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
warn() { printf '    \033[33m%s\033[0m\n' "$1"; }

say "Checking the toolchain"
if command -v bun >/dev/null 2>&1; then
  echo "    bun  $(bun --version)"
elif command -v node >/dev/null 2>&1; then
  warn "bun not found; falling back to npm ($(node --version)). The lockfile is bun.lock, so npm resolves fresh."
else
  echo "    Neither bun nor node is on PATH. Install Node.js >= 20 or bun 1.x first." >&2
  exit 1
fi

# .NET is only needed once the server-api/ phase starts.
if command -v dotnet >/dev/null 2>&1; then
  echo "    dotnet $(dotnet --version)"
else
  warn ".NET SDK not found — fine for now, required when server-api/ gets code."
fi

say "Installing frontend dependencies (elcinema/)"
if command -v bun >/dev/null 2>&1; then
  (cd elcinema && bun install)
else
  (cd elcinema && npm install)
fi

say "Creating elcinema/.env from .env.example if missing"
if [[ ! -f elcinema/.env && -f elcinema/.env.example ]]; then
  cp elcinema/.env.example elcinema/.env
  warn "elcinema/.env created with placeholders — fill in the publishable Supabase keys."
else
  echo "    elcinema/.env already exists; left untouched."
fi

say "Backend"
if compgen -G "server-api/src/*/*.csproj" >/dev/null; then
  (cd server-api && dotnet restore)
else
  echo "    server-api/ is specification-only — nothing to restore. See server-api/README.md."
fi

say "Done"
echo "    Next: ./scripts/dev.sh   (or ./scripts/check.sh before pushing)"
