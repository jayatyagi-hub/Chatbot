@echo off
echo Starting Real Estate Chatbot...

:: Start Backend
echo Starting Backend Server on port 5000...
start "Backend Server" /D "%~dp0backend" "C:\Program Files\nodejs\node.exe" server.js

:: Start Frontend
echo Starting Frontend Server on port 3000...
start "Frontend Server" /D "%~dp0frontend" "C:\Program Files\nodejs\npm.cmd" start

echo Both servers are starting in separate windows.
pause
