@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"

echo.
echo aide-powers セットアップ
echo ========================
echo コピー元: %SCRIPT_DIR%
echo.

REM 第1引数が指定されている場合は非対話モード（メニューをスキップ）
if not "%~1" == "" (
    set "CHOICE=%~1"
    set "NON_INTERACTIVE=1"
    goto :dispatch
)

echo インストール先を選択してください:
echo   1. Kiro IDE / Kiro CLI
echo   2. Claude Code
echo   3. Cursor
echo   4. GitHub Copilot (CLI + VSCode)
echo   5. Gemini CLI
echo   6. Codex
echo   7. 全部
echo   0. キャンセル
echo.
set /p "CHOICE=選択 [0-7]: "

:dispatch

if "%CHOICE%" == "0" goto :cancel
if "%CHOICE%" == "1" goto :kiro
if "%CHOICE%" == "2" goto :claude
if "%CHOICE%" == "3" goto :cursor
if "%CHOICE%" == "4" goto :copilot
if "%CHOICE%" == "5" goto :gemini
if "%CHOICE%" == "6" goto :codex
if "%CHOICE%" == "7" goto :all
echo 無効な選択です。
goto :end

:cleanup_legacy_skills
REM 旧ワークフロー構造のフォルダを削除（フラット化前の残骸）
set "CLEAN_DIR=%~1"
if exist "%CLEAN_DIR%\design-workflow" rmdir /S /Q "%CLEAN_DIR%\design-workflow"
if exist "%CLEAN_DIR%\bugfix-workflow" rmdir /S /Q "%CLEAN_DIR%\bugfix-workflow"
if exist "%CLEAN_DIR%\change-workflow" rmdir /S /Q "%CLEAN_DIR%\change-workflow"
if exist "%CLEAN_DIR%\impl-workflow" rmdir /S /Q "%CLEAN_DIR%\impl-workflow"
if exist "%CLEAN_DIR%\planning-workflow" rmdir /S /Q "%CLEAN_DIR%\planning-workflow"
if exist "%CLEAN_DIR%\refactoring-workflow" rmdir /S /Q "%CLEAN_DIR%\refactoring-workflow"
if exist "%CLEAN_DIR%\reverse-design-workflow" rmdir /S /Q "%CLEAN_DIR%\reverse-design-workflow"
if exist "%CLEAN_DIR%\skills" rmdir /S /Q "%CLEAN_DIR%\skills"
REM Delete phase skills by wildcard so skills retired by phase restructuring are not left behind
for /D %%d in ("%CLEAN_DIR%\fs-planning-phase*") do rmdir /S /Q "%%d"
for /D %%d in ("%CLEAN_DIR%\fs-design-phase*") do rmdir /S /Q "%%d"
for /D %%d in ("%CLEAN_DIR%\fs-reverse-phase*") do rmdir /S /Q "%%d"
for /D %%d in ("%CLEAN_DIR%\fs-impl-phase*") do rmdir /S /Q "%%d"
for /D %%d in ("%CLEAN_DIR%\fs-change-phase*") do rmdir /S /Q "%%d"
for /D %%d in ("%CLEAN_DIR%\fs-bugfix-phase*") do rmdir /S /Q "%%d"
for /D %%d in ("%CLEAN_DIR%\fs-refactoring-phase*") do rmdir /S /Q "%%d"
goto :eof

:copy_with_confirm
set "SRC=%~1"
set "DST=%~2"
if not exist "%DST%" (
    mkdir "%DST%"
    xcopy /E /I /Q /Y "%SRC%" "%DST%" >nul
    echo   コピー完了: %DST%
    goto :eof
)
REM 既存ディレクトリがある場合: サブアイテム単位で上書きコピー
for /D %%d in ("%SRC%\*") do (
    if exist "%DST%\%%~nxd" rmdir /S /Q "%DST%\%%~nxd"
    xcopy /E /I /Q /Y "%%d" "%DST%\%%~nxd" >nul
)
for %%f in ("%SRC%\*.*") do (
    copy /Y "%%f" "%DST%\%%~nxf" >nul
)
echo   コピー完了: %DST%
goto :eof

:kiro
echo.
echo --- Kiro IDE / Kiro CLI ---
set "KIRO_DIR=%USERPROFILE%\.kiro"
if not exist "%KIRO_DIR%" (
    echo   %KIRO_DIR% を作成します。
    mkdir "%KIRO_DIR%"
)
call :cleanup_legacy_skills "%KIRO_DIR%\skills"
echo   steering をコピー中...
if not exist "%KIRO_DIR%\steering" mkdir "%KIRO_DIR%\steering"
if exist "%SCRIPT_DIR%steering\aide-powers-bootstrap.md" (
    copy /Y "%SCRIPT_DIR%steering\aide-powers-bootstrap.md" "%KIRO_DIR%\steering\aide-powers-bootstrap.md" >nul
    echo   コピー完了: aide-powers-bootstrap.md
) else (
    echo   警告: steering\aide-powers-bootstrap.md が見つかりません
)
echo   skills\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%skills" "%KIRO_DIR%\skills"
echo   agents\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%agents\kiro" "%KIRO_DIR%\agents"
echo   Kiro IDE / Kiro CLI: 完了
if not "%CHOICE%" == "7" goto :done
goto :after_kiro

:after_kiro

:claude
echo.
echo --- Claude Code ---
set "CLAUDE_DIR=%USERPROFILE%\.claude"
if not exist "%CLAUDE_DIR%" mkdir "%CLAUDE_DIR%"
echo   hooks\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%hooks" "%CLAUDE_DIR%\hooks"
call :cleanup_legacy_skills "%CLAUDE_DIR%\skills"
echo   skills\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%skills" "%CLAUDE_DIR%\skills"
echo   agents\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%agents" "%CLAUDE_DIR%\agents"
echo   rules\ をコピー中...
if not exist "%CLAUDE_DIR%\rules" mkdir "%CLAUDE_DIR%\rules"
copy /Y "%SCRIPT_DIR%rules\aide-powers-bootstrap.md" "%CLAUDE_DIR%\rules\aide-powers-bootstrap.md" >nul
echo   コピー完了: %CLAUDE_DIR%\rules\aide-powers-bootstrap.md
echo.
echo   Claude Code: 完了
if not "%CHOICE%" == "7" goto :done
goto :after_claude

:after_claude

:cursor
echo.
echo --- Cursor ---
set "CURSOR_DIR=%USERPROFILE%\.cursor"
if not exist "%CURSOR_DIR%\rules" mkdir "%CURSOR_DIR%\rules"
echo   rules\ をコピー中...
copy /Y "%SCRIPT_DIR%rules\aide-powers-bootstrap.mdc" "%CURSOR_DIR%\rules\aide-powers-bootstrap.mdc" >nul
echo   コピー完了: %CURSOR_DIR%\rules\aide-powers-bootstrap.mdc
echo   Cursor: 完了
if not "%CHOICE%" == "7" goto :done
goto :after_cursor

:after_cursor

:copilot
echo.
echo --- GitHub Copilot (CLI + VSCode) ---
set "COPILOT_DIR=%USERPROFILE%\.copilot"
call :cleanup_legacy_skills "%COPILOT_DIR%\skills"
echo   skills\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%skills" "%COPILOT_DIR%\skills"
echo   agents\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%agents" "%COPILOT_DIR%\agents"
echo   instructions をコピー中...
if not exist "%COPILOT_DIR%\instructions" mkdir "%COPILOT_DIR%\instructions"
copy /Y "%SCRIPT_DIR%instructions\aide-powers-bootstrap.instructions.md" "%COPILOT_DIR%\instructions\aide-powers-bootstrap.instructions.md" >nul
echo   コピー完了: %COPILOT_DIR%\instructions\aide-powers-bootstrap.instructions.md
if not exist "%APPDATA%\Code\User\prompts" mkdir "%APPDATA%\Code\User\prompts"
copy /Y "%SCRIPT_DIR%instructions\aide-powers-bootstrap.instructions.md" "%APPDATA%\Code\User\prompts\aide-powers-bootstrap.instructions.md" >nul
echo   コピー完了: %APPDATA%\Code\User\prompts\aide-powers-bootstrap.instructions.md
echo.
echo   VSCode プラグインをインストール中...
set "PLUGIN_DIR=%APPDATA%\Code\agentPlugins\aide-powers"
if not exist "%PLUGIN_DIR%" mkdir "%PLUGIN_DIR%"
if exist "%PLUGIN_DIR%\skills" rmdir /S /Q "%PLUGIN_DIR%\skills"
if exist "%PLUGIN_DIR%\agents" rmdir /S /Q "%PLUGIN_DIR%\agents"
xcopy /E /I /Q /Y "%SCRIPT_DIR%.claude-plugin" "%PLUGIN_DIR%\.claude-plugin" >nul
xcopy /E /I /Q /Y "%SCRIPT_DIR%hooks" "%PLUGIN_DIR%\hooks" >nul
xcopy /E /I /Q /Y "%SCRIPT_DIR%skills" "%PLUGIN_DIR%\skills" >nul
xcopy /E /I /Q /Y "%SCRIPT_DIR%agents" "%PLUGIN_DIR%\agents" >nul
echo   コピー完了: %PLUGIN_DIR%
echo.
echo   VSCode settings.json を設定中...
set "VSCODE_SETTINGS=%APPDATA%\Code\User\settings.json"
if exist "%VSCODE_SETTINGS%" (
    powershell -NoProfile -Command "$f='%VSCODE_SETTINGS%';$j=Get-Content $f -Raw|ConvertFrom-Json;$pluginDir='%PLUGIN_DIR%' -replace '\\\\','/';if(-not $j.'chat.pluginLocations'){$j|Add-Member -NotePropertyName 'chat.pluginLocations' -NotePropertyValue ([PSCustomObject]@{$pluginDir=$true})}else{$p=$j.'chat.pluginLocations';if(-not $p.$pluginDir){$p|Add-Member -NotePropertyName $pluginDir -NotePropertyValue $true}};if(-not $j.'chat.plugins.enabled'){$j|Add-Member -NotePropertyName 'chat.plugins.enabled' -NotePropertyValue $true}else{$j.'chat.plugins.enabled'=$true};$j|ConvertTo-Json -Depth 10|Set-Content $f -Encoding UTF8"
    echo   完了: chat.pluginLocations と chat.plugins.enabled を設定
) else (
    echo   警告: %VSCODE_SETTINGS% が見つかりません (VSCode未インストール?)
)
echo.
echo   GitHub Copilot: 完了
echo   前提: Git for Windows (bash が必要)
echo.
echo   [重要] VSCode の設定で以下を有効にしてください:
echo     "chat.subagents.allowInvocationsFromSubagents": true
echo   aide-powers はサブエージェントのネスト呼び出し（オーケストレータ→サブ→サブ）を使用します。
echo   この設定が false（デフォルト）のままだとワークフローが正常に動作しません。
if not "%CHOICE%" == "7" goto :done
goto :after_copilot

:after_copilot

:gemini
echo.
echo --- Gemini CLI ---
echo.
echo   Gemini CLI ではエクステンションとしてインストールします。
echo     cd %SCRIPT_DIR%
echo     gemini extensions link .
echo.
echo   Gemini CLI: 手動実行
if not "%CHOICE%" == "7" goto :done
goto :after_gemini

:after_gemini

:codex
echo.
echo --- Codex ---
call :cleanup_legacy_skills "%USERPROFILE%\.agents\skills\aide-powers"
echo   skills\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%skills" "%USERPROFILE%\.agents\skills\aide-powers"
echo   agents\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%agents" "%USERPROFILE%\.agents\agents\aide-powers"
echo.
echo   Codex: 完了
if not "%CHOICE%" == "7" goto :done
goto :after_codex

:after_codex

:all
goto :kiro

:done
echo.
echo === セットアップ完了 ===
echo 各プラットフォームを再起動してスキルが有効化されたか確認してください。
goto :end

:cancel
echo キャンセルしました。
goto :end

:end
if defined NON_INTERACTIVE (
    exit /b 0
)
endlocal
pause
