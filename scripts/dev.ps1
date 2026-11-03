# Start the frontend dev server (and, once it exists, the API).
#   .\scripts\dev.ps1              web only
#   .\scripts\dev.ps1 -WithApi     web + API (when server-api/ has code)
param([switch]$WithApi)
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path elcinema/node_modules)) {
  Write-Error "Dependencies missing - run .\scripts\setup.ps1 first."
}

if ($WithApi) {
  $proj = Get-ChildItem server-api/src/*/*.csproj -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($proj) {
    Start-Process -FilePath "dotnet" -ArgumentList "run --project $($proj.FullName)" -WorkingDirectory server-api
    Write-Host "    API started from $($proj.Name)"
  } else {
    Write-Host "    server-api/ has no code yet (specification phase) - starting the web app only." -ForegroundColor Yellow
  }
}

Write-Host "==> elcinema dev server (Ctrl+C to stop; it prints its own URL)" -ForegroundColor Cyan
Set-Location elcinema
if (Get-Command pnpm -ErrorAction SilentlyContinue) { pnpm run dev } else { npm run dev }
