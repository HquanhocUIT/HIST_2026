$ErrorActionPreference = 'Stop'
$repoPath = $PSScriptRoot
$workspacePath = Split-Path -Parent $repoPath
$pythonPath = Join-Path $workspacePath '.venv\Scripts\python.exe'
$backendPath = Join-Path $repoPath 'backend'
$frontendPath = Join-Path $repoPath 'frontend'
$storagePath = Join-Path $backendPath 'storage'

if (-not (Test-Path -LiteralPath $pythonPath)) {
    Write-Host 'Creating project Python environment...'
    & python -m venv (Join-Path $workspacePath '.venv')
    if ($LASTEXITCODE -ne 0) { throw 'Cannot create Python environment.' }
}
& $pythonPath -c 'import fastapi, chromadb, langchain_google_genai' 2>$null
if ($LASTEXITCODE -ne 0) {
    & $pythonPath -m pip install -r (Join-Path $backendPath 'requirements.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Cannot install backend dependencies.' }
}
if (-not (Test-Path -LiteralPath (Join-Path $frontendPath 'node_modules'))) {
    Push-Location $frontendPath
    try { & npm.cmd ci; if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' } } finally { Pop-Location }
}
New-Item -ItemType Directory -Path $storagePath -Force | Out-Null
function Is-Ready([string]$url) {
    try { return (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200 } catch { return $false }
}
$expectedVersion = (Get-Content -LiteralPath (Join-Path $backendPath 'service-version.txt') -Raw).Trim()
if (Is-Ready 'http://127.0.0.1:8000/api/health') {
    $runningHealth = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/health'
    if ($runningHealth.service_version -ne $expectedVersion) {
        $listener = Get-NetTCPConnection -LocalPort 8000 -State Listen | Select-Object -First 1
        $runningBackend = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $listener.OwningProcess)
        if ($runningBackend.CommandLine -notmatch 'uvicorn app.main:app' -or $runningBackend.CommandLine -notmatch [regex]::Escape($backendPath)) {
            throw 'Port 8000 belongs to another service; it was left running.'
        }
        # On Windows the venv launcher has a child Python process. Stop the process
        # that actually owns the port, otherwise the stale backend can remain alive.
        Stop-Process -Id $runningBackend.ProcessId -Force
        Start-Sleep -Milliseconds 500
    }
}
if (-not (Is-Ready 'http://127.0.0.1:8000/api/health')) {
    $backendArgs = @('-X','utf8','-m','uvicorn','app.main:app','--app-dir',('"' + $backendPath + '"'),'--host','127.0.0.1','--port','8000')
    Start-Process -FilePath $pythonPath -ArgumentList $backendArgs -WorkingDirectory $repoPath -WindowStyle Hidden -RedirectStandardOutput (Join-Path $storagePath 'backend.stdout.log') -RedirectStandardError (Join-Path $storagePath 'backend.stderr.log') | Out-Null
}
$backendReady = $false
for ($attempt=0; $attempt -lt 40; $attempt++) {
    if (Is-Ready 'http://127.0.0.1:8000/api/health') { $backendReady=$true; break }
    Start-Sleep -Milliseconds 500
}
if (-not $backendReady) { throw 'Backend did not start. See backend/storage/backend.stderr.log.' }
$health = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/health'
if (-not $health.index_ready) {
    & $pythonPath -X utf8 (Join-Path $backendPath 'scripts\ingest.py')
    if ($LASTEXITCODE -ne 0) { throw 'Could not index data. Check local API configuration.' }
}
if (-not (Is-Ready 'http://127.0.0.1:5173/')) {
    Start-Process -FilePath 'cmd.exe' -ArgumentList @('/d','/c','npm run dev -- --strictPort') -WorkingDirectory $frontendPath -WindowStyle Hidden -RedirectStandardOutput (Join-Path $storagePath 'frontend.stdout.log') -RedirectStandardError (Join-Path $storagePath 'frontend.stderr.log') | Out-Null
}
$frontendReady=$false
for ($attempt=0; $attempt -lt 30; $attempt++) {
    if (Is-Ready 'http://127.0.0.1:5173/') { $frontendReady=$true; break }
    Start-Sleep -Milliseconds 500
}
if (-not $frontendReady) { throw 'Frontend did not start. See backend/storage/frontend.stderr.log.' }
Start-Process 'http://localhost:5173/'
Write-Host 'Demo: http://localhost:5173/'
