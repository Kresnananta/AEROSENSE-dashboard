@echo off
REM ===== AERO-BOT di mini PC (Windows) =====
REM 1) Hub robot-display (start.mjs, repo AEROSENSE-dashboard) : otak bangun/tidur
REM 2) Program kamera (aerobot_vision)                         : sensor + daya monitor dada
REM 3) Chrome kiosk layar dada: https://aerosense.me/aerobot (akun robot)
REM Pertama kali: set SETUP=1 (tanpa kiosk) untuk login akun robot, izinkan mikrofon,
REM dan izinkan "akses perangkat di jaringan lokal" saat Chrome bertanya.

REM --- sesuaikan lokasi folder ---
REM Default: folder ini ada di dalam repo AEROSENSE-dashboard (aerobot-vision\scripts)
set VISION_DIR=%~dp0..
set AEROSENSE_DIR=%~dp0..\..
set CHEST_URL=https://aerosense.me/aerobot
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
set PROFILE=%LOCALAPPDATA%\AEROBOT\chrome-chest

REM Hub: mode kamera, tidur 5 detik setelah tidak ada orang, halaman dada yang diizinkan
start "AERO-BOT hub" cmd /k "cd /d %AEROSENSE_DIR%\robot-display && set AEROBOT_PRESENCE=camera&& set AEROBOT_SLEEP_AFTER_MS=5000&& set AEROBOT_CHAT_URL=%CHEST_URL%&& node start.mjs"
timeout /t 3 /nobreak >nul

start "AERO-BOT kamera" cmd /k "cd /d %VISION_DIR% && venv\Scripts\python.exe -m aerobot_vision --config config.yaml"

if "%SETUP%"=="1" (
  start "" %CHROME% --user-data-dir="%PROFILE%" --no-first-run "%CHEST_URL%"
) else (
  start "" %CHROME% --kiosk --user-data-dir="%PROFILE%" --no-first-run --autoplay-policy=no-user-gesture-required "%CHEST_URL%"
)
