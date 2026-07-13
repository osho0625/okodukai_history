# Gemini CLI Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | Gemini CLI equivalent |
|-----------------|----------------------|
| `Read` (file reading) | `read_file` |
| `Write` (file creation) | `write_file` |
| `Edit` (file editing) | `replace` |
| `Bash` (run commands) | `run_shell_command` |
| `Grep` (search file content) | `grep_search` |
| `Glob` (search files by name) | `glob` |
| `TodoWrite` (task tracking) | `write_todos` |
| `Skill` tool (invoke a skill) | `activate_skill` |
| `WebSearch` | `google_web_search` |
| `WebFetch` | `web_fetch` |
| `Task` tool (dispatch subagent) | Subagent tool（カスタムエージェント定義を `.gemini/agents/*.md` に配置。`@agent_name` で明示呼び出し可能） |
| `AskUserQuestion` | `ask_user` |
| `Monitor` | `run_shell_command` with `is_background: true` |
| `LSP` | No equivalent（ツール一覧に LSP 専用ツールなし） |

## Subagent dispatch

Gemini CLI supports subagents via custom agent definition files (`.gemini/agents/*.md`):

| Claude Code pattern | Gemini CLI equivalent |
|---------------------|----------------------|
| `Task tool (aide-powers:code-reviewer)` | Custom agent in `.gemini/agents/code-reviewer.md` — auto-delegated or `@code-reviewer` |
| `Task tool (general-purpose)` with inline prompt | `@generalist` (built-in general-purpose subagent) |
| Multiple parallel `Task` calls | Not supported — subagents run sequentially |

Built-in subagents:
- `codebase_investigator` — Deep codebase analysis
- `generalist` — General-purpose tasks in isolated context
- `cli_help` — Gemini CLI documentation lookup
- `browser_agent` — Web browser automation (experimental)

Custom agents are defined in:
- Project: `.gemini/agents/*.md`
- User: `~/.gemini/agents/*.md`

**Note:** Subagents cannot call other subagents (recursion protection).

## Additional Gemini CLI tools

These tools are available in Gemini CLI but have no Claude Code equivalent:

| Tool | Purpose |
|------|---------|
| `list_directory` | List files and subdirectories |
| `save_memory` | Persist facts to GEMINI.md across sessions |
| `tracker_create_task` | Rich task management (create, update, list, visualize) |
| `enter_plan_mode` / `exit_plan_mode` | Switch to read-only research mode before making changes |

## Subagent user interaction

サブエージェント（カスタムエージェント / 組み込みサブエージェント）からも、ユーザーへの対話的質問が可能である前提で設計してよい。

- サブエージェント環境でも `ask_user`（= `AskUserQuestion` 相当）ツールが利用でき、番号付き選択肢付きの質問を投げて回答を取得できる想定。
- したがって、要件ヒアリング・設計合意確認・承認取得など「ユーザー対話を伴う処理」をサブエージェントに委譲してよい。
- 「サブエージェントはユーザーと対話できないから対話処理はオーケストレータに残す」という前提で設計する必要はない。
- 注意: Gemini CLI のサブエージェントは他のサブエージェントを呼べない（再帰保護）。対話の可否とは別制約なので混同しないこと。
