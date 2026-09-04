cd C:\EMS_NEW

@"
@echo off
title EMS NEW - LAN Server

cd /d C:\EMS_NEW

echo ========================================
echo        EMS NEW SERVER
echo ========================================
echo.
echo Starting server...
echo.
echo Local: http://localhost:3000
echo LAN  : http://%COMPUTERNAME%:3000
echo.
echo Server is running...
echo Press CTRL+C to stop.
echo ========================================
echo.

npm.cmd start

pause
"@ | Set-Content .\RUN.bat -Encoding ASCII

Write-Host ""
Write-Host "RUN.bat CREATED SUCCESSFULLY"
Write-Host "Location: C:\EMS_NEW\RUN.bat"