@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"

if "%~1" == "" (
    set "TARGET_DIR=%CD%"
) else (
    set "TARGET_DIR=%~f1"
)

echo.
echo aide-powers ローカルセットアップ
echo ================================
echo コピー元: %SCRIPT_DIR%
echo コピー先: %TARGET_DIR%
echo.
echo インストール先を選択してください:
echo   1. Kiro IDE (.kiro\skills\ + .kiro\agents\ + .kiro\steering\)
echo   2. Claude Code (.claude-plugin\ 形式)
echo   3. VSCode Copilot (.github\skills\ 形式)
echo   4. 全部
echo   0. キャンセル
echo.
REM 第2引数が指定されている場合は非対話モード（APM 経由用）
if not "%~2" == "" (
    set "CHOICE=%~2"
    set "NON_INTERACTIVE=1"
) else (
    set /p "CHOICE=選択 [0-4]: "
    set "NON_INTERACTIVE=0"
)

if "%CHOICE%" == "0" goto :cancel
if "%CHOICE%" == "1" goto :kiro_local
if "%CHOICE%" == "2" goto :claude_local
if "%CHOICE%" == "3" goto :copilot_local
if "%CHOICE%" == "4" goto :all
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
REM [replace mode] no overwrite confirmation
if not exist "%DST%" mkdir "%DST%"
xcopy /E /I /Q /Y "%SRC%" "%DST%" >nul
echo   コピー完了: %DST%
goto :eof

:kiro_local
echo.
echo --- Kiro IDE ローカル ---
set "KIRO_DIR=%TARGET_DIR%\.kiro"
call :cleanup_legacy_skills "%KIRO_DIR%\skills"
echo   skills\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%skills" "%KIRO_DIR%\skills"
echo   agents\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%agents\kiro" "%KIRO_DIR%\agents"
echo   steering\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%steering" "%KIRO_DIR%\steering"
if exist "%SCRIPT_DIR%AGENTS.md" (
    echo   AGENTS.md をコピー中...
    if exist "%TARGET_DIR%\AGENTS.md" (
        if "!NON_INTERACTIVE!" == "1" (
            REM 非対話モード: 自動上書き
            echo   上書き: AGENTS.md（非対話モード）
        ) else (
            set /p "YN=  既存の AGENTS.md を上書きしますか？ [y/N]: "
            if /i not "!YN!" == "y" (
                echo   スキップ: AGENTS.md
                goto :skip_agents_md
            )
        )
    )
    copy /Y "%SCRIPT_DIR%AGENTS.md" "%TARGET_DIR%\AGENTS.md" >nul
    echo   完了
)
:skip_agents_md
echo   Kiro IDE ローカル: 完了
if "%CHOICE%" == "4" goto :claude_local
goto :done

:claude_local
echo.
echo --- Claude Code ローカル ---
call :cleanup_legacy_skills "%TARGET_DIR%\skills"
echo   skills\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%skills" "%TARGET_DIR%\skills"
echo   agents\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%agents" "%TARGET_DIR%\agents"
echo   hooks\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%hooks" "%TARGET_DIR%\hooks"
echo   .claude-plugin\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%.claude-plugin" "%TARGET_DIR%\.claude-plugin"
echo   .claude\rules\ をコピー中...
if not exist "%TARGET_DIR%\.claude\rules" mkdir "%TARGET_DIR%\.claude\rules"
copy /Y "%SCRIPT_DIR%rules\aide-powers-bootstrap.md" "%TARGET_DIR%\.claude\rules\aide-powers-bootstrap.md" >nul
echo   コピー完了: %TARGET_DIR%\.claude\rules\aide-powers-bootstrap.md
echo   Claude Code ローカル: 完了
if "%CHOICE%" == "4" goto :copilot_local
goto :done

:copilot_local
echo.
echo --- VSCode Copilot ローカル ---
call :cleanup_legacy_skills "%TARGET_DIR%\.github\skills"
echo   .github\skills\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%skills" "%TARGET_DIR%\.github\skills"
echo   .github\hooks\ をコピー中...
call :copy_with_confirm "%SCRIPT_DIR%hooks" "%TARGET_DIR%\.github\hooks"
echo   .github\instructions\ をコピー中...
if not exist "%TARGET_DIR%\.github\instructions" mkdir "%TARGET_DIR%\.github\instructions"
copy /Y "%SCRIPT_DIR%instructions\aide-powers-bootstrap.instructions.md" "%TARGET_DIR%\.github\instructions\aide-powers-bootstrap.instructions.md" >nul
echo   コピー完了: aide-powers-bootstrap.instructions.md
echo   VSCode Copilot ローカル: 完了
goto :done

:all
goto :kiro_local

:done
echo.
echo === ローカルセットアップ完了 ===
echo プロジェクト %TARGET_DIR% にローカル設定を配置しました。
echo リポジトリにコミットすればチームで共有できます。
goto :end

:cancel
echo キャンセルしました。
goto :end

:end
if not "!NON_INTERACTIVE!" == "1" pause
endlocal
exit /b 0