# Kiro CLI Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | Kiro CLI equivalent |
|-----------------|---------------------|
| `Read` (file reading) | `read` |
| `Write` (file creation) | `write` |
| `Edit` (file editing) | `edit` |
| `Bash` (run commands) | `shell`（aliases: `execute_bash`, `execute_cmd`） |
| `Grep` (search file content) | `grep` |
| `Glob` (search files by name) | `glob` |
| `Skill` tool (invoke a skill) | Skills auto-load natively |
| `Task` tool (dispatch subagent) | `subagent`（aliases: `use_subagent`）。最大4並列 |
| `WebSearch` | `web_search` |
| `WebFetch` | `web_fetch` |
| `TodoWrite` (task tracking) | No direct equivalent |
| `AskUserQuestion` | 専用ツールなし — 対話的セッションの基本動作として質問可能（エージェントが質問テキストを出力し、ユーザーが返答する） |
| `Monitor` | `shell` with background process support（Kiro CLI の shell はバックグラウンドプロセスをサポート） |
| `LSP` | `code`（コードインテリジェンス: シンボル検索、LSP統合） |
| `EnterPlanMode` / `ExitPlanMode` | No equivalent |

## Subagent dispatch

| Claude Code pattern | Kiro CLI equivalent |
|---------------------|---------------------|
| `Task tool (aide-powers:code-reviewer)` | `subagent` with agent config |
| `Task tool (general-purpose)` with inline prompt | `subagent` with inline prompt |
| Multiple parallel `Task` calls | Multiple `subagent` calls |

Custom agents are defined in JSON config files:
- Workspace: `.kiro/agents/`
- Global: `~/.kiro/agents/`

## Kiro CLI specific tools

These tools are available in Kiro CLI but have no Claude Code equivalent:

| Tool | Purpose |
|------|---------|
| `aws` | Execute AWS CLI commands |
| `code` | Code intelligence (symbol search, LSP integration, pattern-based rewriting) |
| `introspect` | Self-documentation lookup |
| `delegate` | Delegate tasks to background agents (async) |
| `knowledge` | Store/retrieve information across sessions (experimental) |
| `todo` | Create and manage ToDo lists (experimental) |
| `session` | Temporarily override CLI settings |
| `report` | Submit issues/feature requests |
| `tool_search` | Find and load MCP tools on demand |

## Web search availability

Kiro CLI has native `web_search` and `web_fetch` tools. However, enterprise administrators can disable web tools via governance settings. If web tools are disabled:
- Use a web search MCP server (e.g., `brave-search`, `tavily`) as a fallback
- Configure in `.kiro/settings/mcp.json` or `~/.kiro/settings/mcp.json`

## Subagent user interaction

サブエージェント（`subagent` で起動した実行環境）からも、ユーザーへの対話的質問が可能である。

- Kiro CLI には専用の対話ツールはないが、対話的セッションの基本動作として、サブエージェントが質問テキストを出力すればユーザーが返答できる（番号付き選択肢形式での提示を推奨）。
- したがって、要件ヒアリング・設計合意確認・承認取得など「ユーザー対話を伴う処理」をサブエージェントに委譲してもよい。
- 「サブエージェントはユーザーと対話できないから対話処理はオーケストレータに残す」という前提で設計する必要はない。
- 注意: headless（非対話）実行時は対話できない。対話が必須の処理は対話モードで実行すること。
