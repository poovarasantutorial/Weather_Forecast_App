@echo off
setlocal
cd /d "%~dp0"
title Weather Forecast App

where py >nul 2>nul
if %errorlevel%==0 (
    set "PYTHON=py -3"
) else (
    where python >nul 2>nul
    if errorlevel 1 (
        echo Python was not found.
        echo Install Python 3 from https://www.python.org/downloads/
        echo During installation, enable "Add Python to PATH".
        pause
        exit /b 1
    )
    set "PYTHON=python"
)

echo Starting the local web server...
start "Weather Forecast Server" cmd /k "%PYTHON% -m http.server 8000 --bind 127.0.0.1"
timeout /t 2 /nobreak >nul
start "Weather Forecast App" http://127.0.0.1:8000
echo.
echo The app is running in your browser.
echo Keep the Weather Forecast Server window open.
echo Close that server window when you want to stop the app.
pause
