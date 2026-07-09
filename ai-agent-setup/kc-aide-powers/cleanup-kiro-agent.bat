@echo off
REM ============================================================
REM kiro agent -> aide-powers migration cleanup script
REM 
REM Targets (explicit file-by-file deletion):
REM   - .kiro\steering\aide-powers-global-rules.md
REM   - .kiro\agents\*.md (22 files)
REM   - AGENTS.md (root)
REM   - aide-powers-global-rules.agents.md (root)
REM
REM Preserved:
REM   - .kiro\specs\ (specifications)
REM   - .kiro\ folder itself
REM   - Everything else
REM ============================================================

echo.
echo === kiro agent cleanup script ===
echo.
echo Files to delete:
echo   .kiro\steering\aide-powers-global-rules.md
echo   .kiro\agents\agent-file-reviewer.md
echo   .kiro\agents\agent-file-writer.md
echo   .kiro\agents\common-skill-detail-designer.md
echo   .kiro\agents\common-skill-detail-reviewer.md
echo   .kiro\agents\flatten-analyzer.md
echo   .kiro\agents\flatten-executor.md
echo   .kiro\agents\flatten-reviewer.md
echo   .kiro\agents\migration-modifier.md
echo   .kiro\agents\migration-planner.md
echo   .kiro\agents\migration-reviewer.md
echo   .kiro\agents\migration-worker.md
echo   .kiro\agents\phase-skill-detail-designer.md
echo   .kiro\agents\phase-skill-detail-reviewer.md
echo   .kiro\agents\phase-skill-structure-designer.md
echo   .kiro\agents\phase-skill-structure-reviewer.md
echo   .kiro\agents\skill-file-reviewer.md
echo   .kiro\agents\skill-file-writer.md
echo   .kiro\agents\tech-investigator.md
echo   .kiro\agents\using-aide-powers-enhancer.md
echo   .kiro\agents\workflow-design-reviewer.md
echo   .kiro\agents\workflow-designer.md
echo   .kiro\agents\workflow-final-reviewer.md
echo   AGENTS.md
echo   aide-powers-global-rules.agents.md
echo.

set /p CONFIRM="Execute? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    exit /b 0
)

echo.
set DELETED=0
set SKIPPED=0

REM --- .kiro\steering ---
echo [steering]
if exist ".kiro\steering\aide-powers-global-rules.md" (
    del /f ".kiro\steering\aide-powers-global-rules.md"
    echo   deleted: aide-powers-global-rules.md
    set /a DELETED+=1
) else (
    echo   skip: aide-powers-global-rules.md (not found)
    set /a SKIPPED+=1
)

REM --- .kiro\agents ---
echo [agents]
for %%F in (
    agent-file-reviewer.md
    agent-file-writer.md
    common-skill-detail-designer.md
    common-skill-detail-reviewer.md
    flatten-analyzer.md
    flatten-executor.md
    flatten-reviewer.md
    migration-modifier.md
    migration-planner.md
    migration-reviewer.md
    migration-worker.md
    phase-skill-detail-designer.md
    phase-skill-detail-reviewer.md
    phase-skill-structure-designer.md
    phase-skill-structure-reviewer.md
    skill-file-reviewer.md
    skill-file-writer.md
    tech-investigator.md
    using-aide-powers-enhancer.md
    workflow-design-reviewer.md
    workflow-designer.md
    workflow-final-reviewer.md
) do (
    if exist ".kiro\agents\%%F" (
        del /f ".kiro\agents\%%F"
        echo   deleted: %%F
        set /a DELETED+=1
    ) else (
        echo   skip: %%F (not found)
        set /a SKIPPED+=1
    )
)

REM --- root files ---
echo [root]
if exist "AGENTS.md" (
    del /f "AGENTS.md"
    echo   deleted: AGENTS.md
    set /a DELETED+=1
) else (
    echo   skip: AGENTS.md (not found)
    set /a SKIPPED+=1
)

if exist "aide-powers-global-rules.agents.md" (
    del /f "aide-powers-global-rules.agents.md"
    echo   deleted: aide-powers-global-rules.agents.md
    set /a DELETED+=1
) else (
    echo   skip: aide-powers-global-rules.agents.md (not found)
    set /a SKIPPED+=1
)

REM --- remove empty folders only ---
echo.
echo [empty folder check]
dir /b ".kiro\agents\" 2>nul | findstr "." >nul
if errorlevel 1 (
    rmdir ".kiro\agents"
    echo   removed: .kiro\agents\ (empty)
) else (
    echo   kept: .kiro\agents\ (files remain)
)

dir /b ".kiro\steering\" 2>nul | findstr "." >nul
if errorlevel 1 (
    rmdir ".kiro\steering"
    echo   removed: .kiro\steering\ (empty)
) else (
    echo   kept: .kiro\steering\ (files remain)
)

echo.
echo === Done: %DELETED% deleted, %SKIPPED% skipped ===
echo.
pause
