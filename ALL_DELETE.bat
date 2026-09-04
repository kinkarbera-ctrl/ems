@echo off
title EMS - ALL DATA DELETE
color 0B

cd /d C:\EMS_NEW

:MENU
cls

echo.
echo ==========================================
echo          EMS ALL DATA DELETE
echo ==========================================
echo.
echo   1. DELETE ALL EMPLOYEE DATA
echo   2. DELETE ALL PHONE DATA
echo   3. DELETE ALL SWITCH DATA
echo   4. EXIT
echo.
echo ==========================================
echo.

choice /C 1234 /N /M "Select option: "

if errorlevel 4 goto EXIT
if errorlevel 3 goto SWITCH
if errorlevel 2 goto PHONE
if errorlevel 1 goto EMPLOYEE


:EMPLOYEE
cls
echo.
echo ==========================================
echo       DELETE ALL EMPLOYEE DATA
echo ==========================================
echo.
echo WARNING!
echo ALL employee records will be deleted.
echo.
choice /C YN /N /M "Are you sure? [Y/N]: "

if errorlevel 2 goto MENU

echo.
echo Deleting employee data...
echo.

node delete-all.js employee

echo.
pause
goto MENU


:PHONE
cls
echo.
echo ==========================================
echo         DELETE ALL PHONE DATA
echo ==========================================
echo.
echo WARNING!
echo ALL phone records will be deleted.
echo.
choice /C YN /N /M "Are you sure? [Y/N]: "

if errorlevel 2 goto MENU

echo.
echo Deleting phone data...
echo.

node delete-all.js phone

echo.
pause
goto MENU


:SWITCH
cls
echo.
echo ==========================================
echo         DELETE ALL SWITCH DATA
echo ==========================================
echo.
echo WARNING!
echo ALL switch and switch-port records
echo will be deleted.
echo.
choice /C YN /N /M "Are you sure? [Y/N]: "

if errorlevel 2 goto MENU

echo.
echo Deleting switch data...
echo.

node delete-all.js switch

echo.
pause
goto MENU


:EXIT
cls
echo.
echo EMS ALL DATA DELETE closed.
echo.
exit /b
