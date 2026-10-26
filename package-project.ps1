# Script to package AuditPulse into a clean, shareable ZIP archive
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$destinationZip = Join-Path (Split-Path -Parent $scriptDir) "audit-pulse-shareable.zip"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "    Packaging AuditPulse for Sharing / Submission       " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if (Test-Path $destinationZip) {
    Remove-Item $destinationZip -Force
}

Write-Host "Gathering project files (excluding node_modules, .git, temp caches)..." -ForegroundColor Yellow

$tempFolder = Join-Path $env:TEMP ("audit-pulse-export-" + [System.Guid]::NewGuid().ToString().Substring(0,8))
New-Item -ItemType Directory -Path $tempFolder | Out-Null

$excludeItems = @("node_modules", ".git", ".vite", ".vite-temp", "dist")

Get-ChildItem -Path $scriptDir | ForEach-Object {
    if ($excludeItems -notcontains $_.Name) {
        Copy-Item -Path $_.FullName -Destination $tempFolder -Recurse -Force
    }
}

Write-Host "Compressing to $destinationZip ..." -ForegroundColor Yellow
Compress-Archive -Path "$tempFolder\*" -DestinationPath $destinationZip -CompressionLevel Optimal

Remove-Item -Path $tempFolder -Recurse -Force

$zipSize = [math]::Round((Get-Item $destinationZip).Length / 1MB, 2)
Write-Host ""
Write-Host "SUCCESS! Clean shareable ZIP created at:" -ForegroundColor Green
Write-Host "$destinationZip ($zipSize MB)" -ForegroundColor White
Write-Host "This ZIP contains everything needed to run AuditPulse (Backend, Frontend, Database Seed, Docker configs, and Documentation)." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
