$ErrorActionPreference = 'Stop'
$tokenPath = Join-Path $PSScriptRoot 'backend\storage\admin-token.txt'
if (-not (Test-Path -LiteralPath $tokenPath)) { throw 'Start the demo before opening Sandbox.' }
$tokenValue = (Get-Content -LiteralPath $tokenPath -Raw).Trim()
$sandboxUrl = 'http://localhost:5173/?sandbox#access=' + [Uri]::EscapeDataString($tokenValue)
Start-Process $sandboxUrl
Write-Host 'Opened local Sandbox. Do not share its access link.'
