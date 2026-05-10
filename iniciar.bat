@echo off
echo ============================================
echo  Iniciando Pro Evol - Backend + Frontend
echo ============================================
echo.

echo [1/2] Iniciando Backend (puerto 3000)...
start "Backend ProEvol" cmd /c "cd /d backend && npx tsx src/index.ts"
timeout /t 4 /nobreak >nul

echo [2/2] Iniciando Frontend (puerto 5173)...
start "Frontend ProEvol" cmd /c "cd /d front && npx vite --host"
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo  Servidores iniciados:
echo  Backend:  http://localhost:3000
echo  Frontend: http://localhost:5173
echo ============================================
echo.
pause
