# The same gate CI runs, locally, in one command.
#   .\scripts\check.ps1          frontend only (default)
#   .\scripts\check.ps1 -All     frontend + backend when server-api/ has code
param([switch]$All)
$ErrorActionPreference = "Continue"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$failed = @()

if (-not (Test-Path elcinema/node_modules)) {
  Write-Error "Dependencies missing - run .\scripts\setup.ps1 first."
  exit 1
}

$pm = if (Get-Command pnpm -ErrorAction SilentlyContinue) { "pnpm" } else { "npm" }

function Invoke-Step {
  param([string]$Label, [string]$Dir, [string]$Exe, [string[]]$Params)
  Write-Host "`n==> $Label" -ForegroundColor Cyan
  Push-Location $Dir
  try {
    & $Exe @Params
    $code = $LASTEXITCODE
  } finally { Pop-Location }
  if ($code -eq 0) {
    Write-Host "    OK  $Label" -ForegroundColor Green
  } else {
    Write-Host "    FAIL $Label (exit $code)" -ForegroundColor Red
    $script:failed += $Label
  }
}

Invoke-Step "Prettier check"   "elcinema" $pm @("run", "format:check")
Invoke-Step "ESLint"           "elcinema" $pm @("run", "lint")
Invoke-Step "TypeScript"       "elcinema" $pm @("run", "typecheck")
Invoke-Step "Vitest"           "elcinema" $pm @("run", "test")
Invoke-Step "Production build" "elcinema" $pm @("run", "build")

# The route tree is committed and CI fails on drift; the build above refreshes
# it from src/routes/**, so a diff means the committed file was left behind.
Write-Host "`n==> routeTree.gen.ts freshness" -ForegroundColor Cyan
$git = Get-Command git -ErrorAction SilentlyContinue
$diff = if ($git) { & git -C $root diff --quiet -- elcinema/src/routeTree.gen.ts; $LASTEXITCODE } else { 0 }
if ($diff -ne 0) {
  Write-Host "    FAIL elcinema/src/routeTree.gen.ts changed during the build - commit the regenerated file." -ForegroundColor Red
  $failed += "routeTree.gen.ts freshness"
} else {
  Write-Host "    OK  routeTree.gen.ts matches the routes on disk" -ForegroundColor Green
}

if ($All) {
  $any = Get-ChildItem server-api/src/*/*.csproj -ErrorAction SilentlyContinue
  if ($any) {
    Invoke-Step ".NET format" "server-api" "dotnet" @("format", "--verify-no-changes")
    Invoke-Step ".NET build"  "server-api" "dotnet" @("build", "--no-incremental")
    Invoke-Step ".NET tests"  "server-api" "dotnet" @("test")
  } else {
    Write-Host "`n==> Backend`n    Skipped - server-api/ is specification-only (see server-api/README.md)."
  }
}

Write-Host ""
if ($failed.Count -gt 0) {
  Write-Host ("Failed: " + ($failed -join ", ")) -ForegroundColor Red
  exit 1
}
Write-Host "All checks passed." -ForegroundColor Green
