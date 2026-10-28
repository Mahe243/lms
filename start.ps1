Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Personal LMS (FastAPI Backend + Vite Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "[1/3] Starting Backend (http://127.0.0.1:8000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$scriptDir\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000`""

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting Frontend (http://localhost:5173)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"cd /d $scriptDir\frontend && npm run dev`""

Start-Sleep -Seconds 2

Write-Host "[3/3] Opening LMS in your browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "LMS is running at http://localhost:5173" -ForegroundColor Green
