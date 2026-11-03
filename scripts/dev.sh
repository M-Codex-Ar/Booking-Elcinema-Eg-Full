#!/usr/bin/env bash
# Start the frontend dev server (and, once it exists, the API).
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

[[ -d elcinema/node_modules ]] || { echo "Dependencies missing — run ./scripts/setup.sh first." >&2; exit 1; }

api=false
[[ "${1:-}" == "--with-api" ]] && api=true

if $api; then
  if compgen -G "server-api/src/*/*.csproj" >/dev/null; then
    (cd server-api && dotnet run --project src/UnifiedControlCenter.Api) &
    api_pid=$!
    trap 'kill $api_pid 2>/dev/null || true' EXIT INT TERM
    echo "    API started as pid $api_pid"
  else
    echo "    server-api/ has no code yet (specification phase) — starting the web app only." >&2
  fi
fi

echo "==> elcinema dev server (Ctrl+C to stop; it prints its own URL)"
cd elcinema
if command -v pnpm >/dev/null 2>&1; then exec pnpm run dev; else exec npm run dev; fi
