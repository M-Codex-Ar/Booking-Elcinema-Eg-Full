# Install everything this repository needs. Safe to re-run.
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Step($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Warn($m) { Write-Host "    $m" -ForegroundColor Yellow }

Step "Checking the toolchain"
$hasPnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if ($hasPnpm) {
  Write-Host "    pnpm  $(pnpm --version)"
} elseif (Get-Command node -ErrorAction SilentlyContinue) {
  Warn "pnpm not found; falling back to npm $(node --version). The lockfile is pnpm-lock.yaml, so npm resolves fresh."
} else {
  Write-Error "Neither pnpm nor node is on PATH. Install Node.js >= 20 or pnpm 9+ first."
}

if (Get-Command dotnet -ErrorAction SilentlyContinue) {
  Write-Host "    dotnet $(dotnet --version)"
} else {
  Warn ".NET SDK not found - fine for now, required when server-api/ gets code."
}

Step "Installing frontend dependencies (elcinema/)"
Push-Location elcinema
try { if ($hasPnpm) { pnpm install } else { npm install } } finally { Pop-Location }

Step "Creating elcinema/.env from .env.example if missing"
if (-not (Test-Path elcinema/.env) -and (Test-Path elcinema/.env.example)) {
  Copy-Item elcinema/.env.example elcinema/.env
  Warn "elcinema/.env created with placeholders - fill in the publishable Supabase keys."
} else {
  Write-Host "    elcinema/.env already exists; left untouched."
}

Step "Backend"
if (Get-ChildItem server-api/src/*/*.csproj -ErrorAction SilentlyContinue) {
  Push-Location server-api
  try { dotnet restore } finally { Pop-Location }
} else {
  Write-Host "    server-api/ is specification-only - nothing to restore. See server-api/README.md."
}

Step "Done"
Write-Host "    Next: .\scripts\dev.ps1   (or .\scripts\check.ps1 before pushing)"
