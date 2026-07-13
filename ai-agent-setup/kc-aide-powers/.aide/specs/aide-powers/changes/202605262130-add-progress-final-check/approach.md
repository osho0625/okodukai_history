# Approach

## Summary

- Approach: Addition only (OCP compliant)
- OCP Result: No existing structure changes needed
- Refactoring: Not required

## New Files (8)

1. skills/fs-planning-phase4-final-check/SKILL.md
2. skills/fs-design-phase11-final-check/SKILL.md
3. skills/fs-impl-phase7-final-check/SKILL.md
4. skills/fs-reverse-phase6-final-check/SKILL.md
5. skills/fs-change-phase10-final-check/SKILL.md
6. skills/fs-bugfix-phase7-final-check/SKILL.md
7. skills/fs-refactoring-phase7-final-check/SKILL.md
8. .kiro/agents/progress-final-checker.md

## Modified Files (9)

1-7. Each WF final phase skill: add next phase transition
8. progress-file-format.md: add phase mapping rows
9. skills/phase-compliance-check/SKILL.md: add honesty principle section

## Phase Skill Common Structure

1. Pre-process: progress-resume-check + phase-compliance-check verify
2. Main: session history text to verification agent
3. PASS: update status. FAIL: reset and retry
4. Honesty principle embedded

## Verification Agent Checks

1. Session history naturalness
2. Phase skill execution traces
3. User conversation history
4. Falsified compliance-checker info detection
