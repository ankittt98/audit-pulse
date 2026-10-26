@echo off
echo ========================================================
echo        Starting AuditPulse Full-Stack Platform
echo ========================================================
echo Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH. Please install Node.js 20+ from https://nodejs.org
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing project dependencies...
    call npm install
)

echo.
echo Launching AuditPulse (Server on :5000, Client on :5173)...
npm run dev
pause
