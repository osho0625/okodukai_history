# VSCode GitHub Copilot Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | VSCode Copilot equivalent |
|-----------------|--------------------------|
| `Read` (file reading) | `read` / file reading tool |
| `Write` (file creation) | `create` / `create_file` |
| `Edit` (file editing) | `edit` / `replace_string_in_file` |
| `Bash` (run commands) | `terminal` / terminal tool |
| `Grep` (search file content) | `search` / code search tool |
| `Glob` (search files by name) | `search` |
| `Skill` tool (invoke a skill) | Skills auto-load on match / `/` slash command |
| `WebSearch` | `web` tool |
| `WebFetch` | `web/fetch` (`#tool:web/fetch`) |
| `Task` tool (dispatch subagent) | `runSubagent` / `agent` (see [Subagent dispatch](#subagent-dispatch)) |
| Multiple `Task` calls (parallel) | Multiple `runSubagent` calls |
| `TodoWrite` (task tracking) | No direct equivalent |
| `AskUserQuestion` | `vscode/askQuestions` |
| `Monitor` | `terminal`（バックグラウンド実行可能） |
| `LSP` | IDE内蔵 Language Server（VSCode のコア機能） |
| `EnterPlanMode` / `ExitPlanMode` | Plan agent (separate agent mode) |

## Auto-mapping from Claude format

VSCode Copilot detects Claude-format agent files (`.claude/agents/*.md`) and
automatically maps Claude-specific tool names to VSCode equivalents. Many skills
will work without modification, but explicit mapping is recommended for reliability.

## Subagent dispatch

VSCode Copilot supports custom agents as subagents (Experimental):

| Claude Code pattern | VSCode Copilot equivalent |
|---------------------|--------------------------|
| `Task tool (aide-powers:code-reviewer)` | `runSubagent` with custom `.agent.md` |
| `Task tool (general-purpose)` with inline prompt | `runSubagent` with inline prompt |
| Multiple parallel `Task` calls | Multiple parallel `runSubagent` calls |

Custom agents are defined in `.agent.md` files:
- Workspace: `.github/agents/`, `.claude/agents/`
- User: `~/.copilot/agents/`

Each subagent can have its own model, tools, and instructions.
Set `user-invocable: false` for subagent-only agents.

## Nested subagents

VSCode Copilot supports recursive subagent invocation (max depth 5).
Enable via `chat.subagents.allowInvocationsFromSubagents` setting.

## Additional VSCode Copilot tools

These tools are available in VSCode Copilot but have no Claude Code equivalent:

| Tool | Purpose |
|------|---------|
| `#tool:web/fetch` | Fetch content from a specific URL |

## Subagent user interaction

サブエージェント（`runSubagent` で起動した実行環境）からも、ユーザーへの対話的質問が可能である。

- サブエージェント環境でも `vscode/askQuestions`（= `AskUserQuestion` 相当）ツールが利用でき、番号付き選択肢付きの質問を投げて回答を取得できる。
- したがって、要件ヒアリング・設計合意確認・承認取得など「ユーザー対話を伴う処理」をサブエージェントに委譲してもよい。サブエージェント内で直接ユーザーに確認を取れる。
- 「サブエージェントはユーザーと対話できないから対話処理はオーケストレータに残す」という前提で設計する必要はない。
