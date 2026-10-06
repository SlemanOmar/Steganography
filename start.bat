@echo off
chcp 65001 >nul
setlocal
pushd "%~dp0"
if errorlevel 1 goto directory_error

where node >nul 2>&1
if errorlevel 1 goto missing_node
where npm >nul 2>&1
if errorlevel 1 goto missing_node

node -e "const [major,minor]=process.versions.node.split('.').map(Number); process.exit((major===20&&minor>=19)||(major===22&&minor>=12)||major>=24?0:1)"
if errorlevel 1 goto old_node

if exist "node_modules\vite\bin\vite.js" goto start_app
echo Installing project dependencies...
call npm ci --no-audit --no-fund
if errorlevel 1 goto install_error

:start_app
echo Starting Wéne Cipher. Your browser will open automatically.
echo Keep this window open. Press Ctrl+C to stop the app.
call npm run dev -- --host 127.0.0.1 --open
set "wene_exit_code=%errorlevel%"
if not "%wene_exit_code%"=="0" (
    echo.
    echo The server stopped with an error. See the message above.
    pause
)
popd
exit /b %wene_exit_code%

:missing_node
echo Node.js and npm are required. Install Node.js LTS from https://nodejs.org/
echo Then double-click start.bat again.
goto fail

:old_node
echo Please install Node.js 24 LTS or newer from https://nodejs.org/
goto fail

:install_error
echo Dependency installation failed. Check your internet connection and the error above.
goto fail

:directory_error
echo Could not open the project folder.
pause
exit /b 1

:fail
pause
popd
exit /b 1
