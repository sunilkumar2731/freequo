@echo off
echo ========================================
echo    Starting Freequo Development
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "Freequo Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "Freequo Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo    ✅ Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo ⚠️  Keep both terminal windows open!
echo.
pause
