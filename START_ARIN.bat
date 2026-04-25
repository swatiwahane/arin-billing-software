@echo off
echo ==========================================
echo       ARIN BILLBOT - STARTUP MANAGER
echo ==========================================
echo.

cd backend
echo [1/3] Installing/Checking Backend Dependencies...
python -m pip install -r requirements.txt

echo.
echo [2/3] Starting Backend Server...
start "Billbot Backend" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 5000"

timeout /t 3

echo.
echo [3/3] Starting Frontend Dashboard...
cd ..
start "Billbot Frontend" cmd /k "npm run dev -- --host"

echo.
echo ==========================================
echo        SOFTWARE IS NOW RUNNING!
echo   Local: http://localhost:5173
echo   Network: Use your machine's IP address
echo ==========================================
pause
