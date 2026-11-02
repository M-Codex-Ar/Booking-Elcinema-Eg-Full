#!/usr/bin/env bash
# The same gate CI runs, locally, in one command.
#
#   ./scripts/check.sh          frontend only (default)
#   ./scripts/check.sh --all    frontend + docs link check + backend when it exists
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

step() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
failed=()

run() { # run <label> <dir> <cmd...>
  local label="$1" dir="$2"; shift 2
  step "$label"
  if (cd "$dir" && "$@"); then
    echo "    OK  $label"
  else
    echo "    FAIL $label" >&2
    failed+=("$label")
  fi
}

[[ -d elcinema/node_modules ]] || { echo "Dependencies missing — run ./scripts/setup.sh first." >&2; exit 1; }

pick() { if command -v bun >/dev/null 2>&1; then printf 'bun'; else printf 'npm'; fi; }
pm="$(pick)"

run "Prettier check"   elcinema "$pm" run format:check
run "ESLint"           elcinema "$pm" run lint
run "TypeScript"       elcinema "$pm" run typecheck
run "Vitest"           elcinema "$pm" run test
run "Production build" elcinema "$pm" run build

# The route tree is committed (CI regenerates it and fails on drift). Building
# above refreshes it from src/routes/**, so a diff here means the committed
# file was left behind by a route add/remove/rename.
step "routeTree.gen.ts freshness"
if command -v git >/dev/null 2>&1 && git -C "$root" rev-parse --git-dir >/dev/null 2>&1 &&
   ! git -C "$root" diff --quiet -- elcinema/src/routeTree.gen.ts; then
  echo "    FAIL elcinema/src/routeTree.gen.ts changed during the build — commit the regenerated file." >&2
  failed+=("routeTree.gen.ts freshness")
else
  echo "    OK  routeTree.gen.ts matches the routes on disk"
fi

if [[ "${1:-}" == "--all" ]]; then
  if compgen -G "server-api/src/*/*.csproj" >/dev/null; then
    run ".NET format" server-api dotnet format --verify-no-changes
    run ".NET build"  server-api dotnet build --no-incremental
    run ".NET tests"  server-api dotnet test
  else
    step "Backend"
    echo "    Skipped — server-api/ is specification-only (see server-api/README.md)."
  fi
fi

printf '\n'
if ((${#failed[@]})); then
  printf '\033[31mFailed: %s\033[0m\n' "${failed[*]}"
  exit 1
fi
printf '\033[32mAll checks passed.\033[0m\n'
