# Kiro IDE Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | Kiro IDE equivalent |
|-----------------|---------------------|
| `Read` (file reading) | `readFile`, `readMultipleFiles`, `readCode` |
| `Write` (file creation) | `fsWrite` |
| `Edit` (file editing) | `strReplace` |
| `Bash` (run commands) | `executePwsh` |
| `Grep` (search file content) | `grepSearch` |
| `Glob` (search files by name) | `fileSearch` |
| `Skill` tool (invoke a skill) | `discloseContext` |
| `Task` tool (dispatch subagent) | `invokeSubAgent` |
| `WebSearch` | `remote_web_search` |
| `WebFetch` | `webFetch` |
| `TodoWrite` (task tracking) | `taskStatus` (spec tasks only) |
| `AskUserQuestion` | `userInput`（実体ツール名は `user_input`） |
| `Monitor` | `controlPwshProcess` + `getProcessOutput` + `listProcesses` |
| `LSP` | `readCode`（AST解析）+ IDE内蔵 Language Server |
| `EnterPlanMode` / `ExitPlanMode` | No equivalent |

## Kiro IDE specific tools

These tools are available in Kiro IDE but have no Claude Code equivalent:

| Tool | Purpose |
|------|---------|
| `readCode` | AST-based code analysis (signatures, symbols) |
| `readMultipleFiles` | Read multiple files in a single call |
| `fsAppend` | Append content to existing files |
| `listDirectory` | List directory contents |
| `semanticRename` | Rename symbols across codebase |
| `smartRelocate` | Move files with automatic import updates |
| `controlPwshProcess` | Start/stop background processes |
| `getProcessOutput` | Read output from background processes |
| `listProcesses` | List running background processes |
| `createHook` | Create agent hooks for IDE events |
| `kiroPowers` | Manage and use Kiro Powers |

## Notes

- `executePwsh` runs PowerShell on Windows, bash on Linux/macOS
- `readFile` is for single files; `readMultipleFiles` for batch reads; `readCode` for AST analysis
- `discloseContext` is the skill invocation tool — do not read SKILL.md files directly with `readFile`
- `invokeSubAgent` dispatches named custom agents defined in `.kiro/agents/` or `~/.kiro/agents/`

## Subagent dispatch

| Claude Code pattern | Kiro IDE equivalent |
|---------------------|---------------------|
| `Task tool (aide-powers:code-reviewer)` | `invokeSubAgent(name="code-reviewer", ...)` |
| `Task tool (general-purpose)` with inline prompt | `invokeSubAgent(name="general-task-execution", ...)` |
| Multiple parallel `Task` calls | Multiple `invokeSubAgent` calls |

Custom agents are defined in:
- Workspace: `.kiro/agents/`
- Global: `~/.kiro/agents/`

## Subagent user interaction

サブエージェント（`invokeSubAgent` で起動した実行環境）からも、ユーザーへの対話的質問が可能である（実機検証済み 2026-06-02）。

- サブエージェント環境でも `user_input`（= `userInput` / `AskUserQuestion` 相当）ツールが利用でき、番号付き選択肢付きの質問を投げて回答を取得できる。
- したがって、要件ヒアリング・設計合意確認・承認取得など「ユーザー対話を伴う処理」をサブエージェントに委譲してもよい。サブエージェント内で直接ユーザーに確認を取れる。
- 「サブエージェントはユーザーと対話できないから対話処理はオーケストレータに残す」という前提で設計する必要はない。
