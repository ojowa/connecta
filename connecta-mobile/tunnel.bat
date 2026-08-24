@echo off
echo Setting up USB tunnel...
adb reverse tcp:3000 tcp:3000
adb reverse tcp:3001 tcp:3001
adb reverse --list
echo.
echo Done. Port 3000 (API) and 3001 (WS) tunneled to PC.
