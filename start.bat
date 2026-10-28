@echo off
echo ========================================================
echo Starting Personal LMS (FastAPI Backend + Vite Frontend)
echo ========================================================

cd /d "%~dp0"

echo [1/3] Starting Backend (http://127.0.0.1:8000)...
start "LMS Backend" cmd /k ".\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak > nul

echo [2/3] Starting Frontend (http://localhost:5173)...
cd /d "%~dp0frontend"
start "LMS Frontend" cmd /k "npm run dev"

timeout /t 2 /nobreak > nul

echo [3/3] Opening LMS in your browser...
start http://localhost:5173

echo ========================================================
echo LMS is now running! 
echo Close the Backend/Frontend command windows when finished.
echo ========================================================
