@echo off
setlocal enabledelayedexpansion
REM Start the visual companion server (Windows version)
REM Usage: start-server.bat [--project-dir <path>]

set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR="
set "BIND_HOST=127.0.0.1"
set "URL_HOST=localhost"

:parse_args
if "%~1"=="" goto :args_done
if "%~1"=="--project-dir" (
    set "PROJECT_DIR=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--host" (
    set "BIND_HOST=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--url-host" (
    set "URL_HOST=%~2"
    shift
    shift
    goto :parse_args
)
echo {"error": "Unknown argument: %~1"}
exit /b 1

:args_done

REM Generate session ID
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "[DateTimeOffset]::UtcNow.ToUnixTimeSeconds()"') do set "TIMESTAMP=%%i"
set "SESSION_ID=%RANDOM%-%TIMESTAMP%"

if defined PROJECT_DIR (
    set "SESSION_DIR=%PROJECT_DIR%\.aide\brainstorm\%SESSION_ID%"
) else (
    set "SESSION_DIR=%TEMP%\brainstorm-%SESSION_ID%"
)

set "CONTENT_DIR=%SESSION_DIR%\content"
set "STATE_DIR=%SESSION_DIR%\state"

if not exist "%CONTENT_DIR%" mkdir "%CONTENT_DIR%"
if not exist "%STATE_DIR%" mkdir "%STATE_DIR%"

REM Set environment variables for server
set "BRAINSTORM_DIR=%SESSION_DIR%"
set "BRAINSTORM_HOST=%BIND_HOST%"
set "BRAINSTORM_URL_HOST=%URL_HOST%"

REM Start server in foreground (Kiro IDE uses controlPwshProcess to background it)
node "%SCRIPT_DIR%server.cjs"
