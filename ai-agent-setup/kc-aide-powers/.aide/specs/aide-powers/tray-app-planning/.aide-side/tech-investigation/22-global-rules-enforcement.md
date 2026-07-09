# AI Agent グローバルルール強制メカニズム調査

## 調査概要

- **調査対象**: 8プラットフォームにおけるAI Agentへのグローバルルール指示・強制メカニズム
- **調査日**: 2025年7月
- **調査の背景**: aide-powersのグローバルルール（フェーズ省略禁止、コミット前確認等）をAIに確実に遵守させるため、各プラットフォームの仕組みを調査

## 要約

各プラットフォームは「常時適用ルール」の仕組みを持つが、**いずれもプロンプトレベルの指示であり、技術的に100%の遵守を保証するものではない**。唯一の技術的強制手段は **Hooks（Claude Code, Kiro IDE）** であり、ツール実行前後にシェルコマンドやHTTPリクエストで検証・ブロックが可能。aide-powersとしては、(1) 各プラットフォームの常時適用ファイルにルールを配置し、(2) Hooks対応プラットフォームではPreToolUse/Stop等で技術的強制を併用する二層戦略が最適。

---

## 1. Claude Code（CLAUDE.md）

### グローバルルール指示の仕組み

| ファイル/設定 | 場所 | 適用範囲 |
|---|---|---|
| `CLAUDE.md` | プロジェクトルート or `.claude/CLAUDE.md` | プロジェクト全体（チーム共有） |
| `~/.claude/CLAUDE.md` | ユーザーホーム | 全プロジェクト（個人） |
| `CLAUDE.local.md` | プロジェクトルート | 個人・プロジェクト固有 |
| `.claude/rules/*.md` | プロジェクト内 | パス指定可能（glob） |
| `~/.claude/rules/*.md` | ユーザーホーム | 全プロジェクト（個人） |
| Managed CLAUDE.md | `/Library/Application Support/ClaudeCode/CLAUDE.md` 等 | 組織全体（IT管理） |
| `claudeMd` in managed-settings.json | 管理設定 | 組織全体 |

### 適用範囲
- ワークスペース全体（常時適用）
- パス指定（`.claude/rules/` の `paths:` frontmatter）
- ディレクトリ階層（サブディレクトリのCLAUDE.mdは遅延読み込み）

### 優先順位（高→低）
1. Managed policy（組織管理、上書き不可）
2. Local（`.claude/settings.local.json`）
3. Project（`.claude/settings.json`）
4. User（`~/.claude/settings.json`）

### 強制力
- **CLAUDE.mdはコンテキストとして注入されるが、技術的強制ではない**（公式ドキュメント明記）
- **Hooks**: `PreToolUse`, `PostToolUse`, `Stop`, `UserPromptSubmit` 等のライフサイクルイベントでシェルコマンド/HTTP/MCP/LLMプロンプトを実行し、ツール実行をブロック可能
  - `PreToolUse` → `permissionDecision: "deny"` でツール実行を阻止
  - `Stop` → `decision: "block"` でAgentの停止を阻止（タスク未完了時に継続強制）
  - `PostToolUse` → ファイル書き込み後にlint実行等
  - `UserPromptSubmit` → プロンプト送信前にバリデーション
- **permissions.deny**: 特定ツール/ファイルへのアクセスを技術的にブロック
- **Sandbox**: bash コマンドのファイルシステム・ネットワークアクセスを制限

### 制限事項
- CLAUDE.md: 200行以下推奨（長いと遵守率低下）
- Hooks: タイムアウトあり（デフォルト600秒）
- ルール間の矛盾があるとAIが任意に選択する可能性

### 2025年最新情報
- Auto Memory: AIが自動的に学習を蓄積（MEMORY.md）
- `.claude/rules/` によるモジュラーなルール管理
- Prompt/Agent型Hooks（LLMによる判定）
- Managed settings: 組織レベルの強制設定
- `@path` importによるファイル参照

---

## 2. Kiro IDE（Steering Files）

### グローバルルール指示の仕組み

| ファイル/設定 | 場所 | 適用範囲 |
|---|---|---|
| Workspace steering | `.kiro/steering/*.md` | ワークスペース全体 |
| Global steering | `~/.kiro/steering/*.md` | 全ワークスペース |
| AGENTS.md | プロジェクトルート or `~/.kiro/steering/` | 常時適用 |

### 適用範囲（Inclusion Modes）
- **always**（デフォルト）: 全インタラクションに自動適用
- **fileMatch**: 指定パターンに一致するファイル作業時のみ適用
- **manual**: `#steering-file-name` で明示的に参照時のみ
- **auto**: descriptionに基づきAIが関連性を判断して自動適用

### 優先順位
- Workspace steering > Global steering（競合時はワークスペース優先）
- AGENTS.md: 常時適用（inclusion modesなし）

### 強制力
- **Hooks**: Kiro IDEもHookシステムを持つ
  - File Save, Pre/Post Tool Use, Pre/Post Task Execution, User Prompt Submission, Agent Turn Completion
  - Ask Kiro（エージェントプロンプト）またはRun Command（シェルコマンド）
  - ファイルパターンやツール名でフィルタリング可能
- Steering自体はプロンプトレベル（技術的強制ではない）

### 制限事項
- 文字数制限の明示的な記載なし
- AGENTS.mdはinclusion modesをサポートしない（常時適用のみ）

### 2025年最新情報
- `inclusion: auto` モード（description基づく自動判定）
- `#[[file:<path>]]` によるファイル参照
- Team steering（MDM/Group Policy経由での配布）
- AGENTS.md標準のサポート

---

## 3. VSCode GitHub Copilot

### グローバルルール指示の仕組み

| ファイル/設定 | 場所 | 適用範囲 |
|---|---|---|
| `copilot-instructions.md` | `.github/copilot-instructions.md` | リポジトリ全体 |
| Path-specific instructions | `.github/instructions/NAME.instructions.md` | 指定パスのファイル |
| AGENTS.md | リポジトリ内任意の場所 | ディレクトリツリーで最も近いファイル |
| CLAUDE.md / GEMINI.md | リポジトリルート | 代替として使用可能 |
| User Rules | Cursor Settings → Rules | 全プロジェクト（個人） |
| Team Rules | Cursor Dashboard | チーム全体（Team/Enterprise） |

### 適用範囲
- リポジトリ全体（copilot-instructions.md）
- パス指定（`applyTo` frontmatter、glob構文）
- ディレクトリツリー（AGENTS.md: 最も近いファイルが優先）

### 優先順位
- Personal instructions > Repository instructions > Organization instructions
- 全ての関連instructionsがCopilotに提供される

### 強制力
- **技術的強制メカニズムなし**
- プロンプトレベルの指示のみ
- Copilot code reviewでのカスタムインストラクション有効/無効切り替え可能

### 制限事項
- copilot-instructions.md: 2ページ以下推奨
- path-specific: `excludeAgent` で code-review / cloud-agent を除外可能

### 2025年最新情報
- AGENTS.md標準のサポート（CLAUDE.md, GEMINI.mdも認識）
- Path-specific instructions（`.github/instructions/`）
- Copilot cloud agentによる自動生成機能

---

## 4. Cursor（.cursor/rules/）

### グローバルルール指示の仕組み

| ファイル/設定 | 場所 | 適用範囲 |
|---|---|---|
| Project Rules | `.cursor/rules/*.md` or `.cursor/rules/*.mdc` | プロジェクト |
| User Rules | Cursor Settings → Rules | 全プロジェクト（個人） |
| Team Rules | Cursor Dashboard | チーム全体（Team/Enterprise） |
| AGENTS.md | プロジェクトルート・サブディレクトリ | プロジェクト |

### 適用範囲（Rule Types）
- **Always Apply** (`alwaysApply: true`): 全チャットセッションに適用
- **Apply Intelligently** (`description` あり、`globs` なし): AIが関連性を判断
- **Apply to Specific Files** (`globs` 指定): ファイルパターン一致時
- **Apply Manually** (上記いずれもなし): `@rule-name` で明示的に参照時

### 優先順位
- Team Rules > Project Rules > User Rules
- 全ての適用可能なルールがマージされる

### 強制力
- **Team Rules (Enforce)**: チームメンバーが無効化できない強制ルール
- ただし技術的強制（ツール実行ブロック等）ではなく、プロンプトレベル
- Hooks/PreToolUse相当の仕組みは**なし**

### 制限事項
- 500行以下推奨
- Agent (Chat) にのみ適用（Cursor Tab等には非適用）

### 2025年最新情報
- `.mdc` 拡張子（frontmatter付きルール）
- Remote Rules via GitHub（外部リポジトリからインポート）
- `/create-rule` コマンドでAIがルール生成
- AGENTS.md サポート（サブディレクトリ含む）
- Team Rules の Enforce 機能

---

## 5. Gemini CLI（GEMINI.md）

### グローバルルール指示の仕組み

| ファイル/設定 | 場所 | 適用範囲 |
|---|---|---|
| GEMINI.md | プロジェクトルート | プロジェクト全体 |
| AGENTS.md | プロジェクトルート（設定で指定可能） | プロジェクト全体 |
| `~/.gemini/settings.json` | ユーザーホーム | グローバル設定 |

### 適用範囲
- プロジェクト全体（GEMINI.md）
- `settings.json` の `context.fileName` で代替ファイル名指定可能

### 優先順位
- 明示的なユーザープロンプト > GEMINI.md/AGENTS.md

### 強制力
- **技術的強制メカニズムなし**（公開情報の範囲）
- プロンプトレベルの指示のみ
- Trusted Folders機能（実行ポリシーの制御）はあるが、ルール遵守の強制ではない

### 制限事項
- 1Mトークンコンテキストウィンドウ（ファイルサイズの実質的制限は緩い）
- 詳細な文字数制限の公式情報なし

### 2025年最新情報
- AGENTS.md標準のサポート（settings.jsonで設定）
- Google Search grounding
- MCP Server統合
- Sandboxing & Security機能

---

## 6. Codex CLI（AGENTS.md）

### グローバルルール指示の仕組み

| ファイル/設定 | 場所 | 適用範囲 |
|---|---|---|
| AGENTS.md | プロジェクトルート・サブディレクトリ | ディレクトリツリー |

### 適用範囲
- ディレクトリツリーで最も近いAGENTS.mdが優先
- サブディレクトリごとに異なるルールを設定可能

### 優先順位
- 明示的なユーザープロンプト > AGENTS.md
- 最も近いAGENTS.mdが優先

### 強制力
- **技術的強制メカニズムなし**
- プロンプトレベルの指示のみ
- Codex CLIはサンドボックス環境で実行（ファイルシステム制限はあるがルール遵守の強制ではない）

### 制限事項
- 公式の文字数制限情報なし
- AGENTS.mdは標準Markdownフォーマット

### 2025年最新情報
- AGENTS.md標準の策定元の一つ（OpenAI主導）
- Codex Web（クラウド版）とCodex CLI（ローカル版）の分離
- IDE拡張（VS Code, Cursor, Windsurf対応）

---

## 7. OpenCode / Crush

### グローバルルール指示の仕組み

| ファイル/設定 | 場所 | 適用範囲 |
|---|---|---|
| AGENTS.md | プロジェクトルート | プロジェクト全体 |
| Agent Skills (SKILL.md) | `.agents/skills/`, `.crush/skills/`, `.claude/skills/`, `.cursor/skills/` | スキル単位 |
| `options.context_paths` | crush.json | 追加コンテキストファイル |
| `options.initialize_as` | crush.json | 初期化ファイル名カスタマイズ |

### 適用範囲
- プロジェクト全体（AGENTS.md）
- グローバルスキル: `~/.config/crush/skills/` or `~/.config/agents/skills/`

### 優先順位
- `.crush.json` > `crush.json` > `$HOME/.config/crush/crush.json`

### 強制力
- **Hooks**: 予備的サポートあり（詳細は限定的）
- **permissions.allowed_tools**: ツール実行の許可制御
- `--yolo` フラグで全許可（危険）
- `.crushignore` でファイル除外

### 制限事項
- OpenCodeはアーカイブ済み、Crushとして継続
- Hooks機能は「preliminary support」（初期段階）

### 2025年最新情報
- OpenCode → Crush へのリブランド（Charm社）
- Agent Skills標準のサポート（SKILL.md）
- 複数プラットフォームのスキルディレクトリ互換（`.claude/skills/`, `.cursor/skills/`）
- FSL-1.1-MIT ライセンス

---

## 8. Copilot CLI（GitHub Copilot CLI）

### グローバルルール指示の仕組み

GitHub Copilot CLIは、GitHub Copilot のターミナル版であり、IDE版と同じインストラクション体系を使用する。

| ファイル/設定 | 場所 | 適用範囲 |
|---|---|---|
| `.github/copilot-instructions.md` | リポジトリ | リポジトリ全体 |
| `.github/instructions/NAME.instructions.md` | リポジトリ | パス指定 |
| AGENTS.md | リポジトリ内 | ディレクトリツリー |

### 強制力
- VSCode GitHub Copilotと同等（技術的強制なし）
- プロンプトレベルの指示のみ

---

## 比較表

| プラットフォーム | ルールファイル | 常時適用 | パス指定 | 条件付き | Hooks/強制 | 組織管理 |
|---|---|---|---|---|---|---|
| Claude Code | CLAUDE.md, .claude/rules/ | ✅ | ✅ (paths:) | ✅ | ✅ PreToolUse等 | ✅ Managed |
| Kiro IDE | .kiro/steering/*.md | ✅ | ✅ (fileMatch) | ✅ (auto) | ✅ Pre/Post Tool Use | ✅ Team/MDM |
| VSCode Copilot | .github/copilot-instructions.md | ✅ | ✅ (applyTo) | ❌ | ❌ | ✅ Org instructions |
| Cursor | .cursor/rules/*.mdc | ✅ | ✅ (globs) | ✅ (description) | ❌ | ✅ Team Rules (Enforce) |
| Gemini CLI | GEMINI.md | ✅ | ❌ | ❌ | ❌ | ❌ |
| Codex CLI | AGENTS.md | ✅ | ❌ (サブディレクトリ) | ❌ | ❌ | ❌ |
| Crush (旧OpenCode) | AGENTS.md, SKILL.md | ✅ | ❌ | ❌ | △ (preliminary) | ❌ |
| Copilot CLI | .github/copilot-instructions.md | ✅ | ✅ | ❌ | ❌ | ✅ Org |

---

## ルール無視問題への各プラットフォームの対策

### 共通認識
全プラットフォームが「ルールはコンテキストとして注入されるが、100%の遵守は保証されない」という立場。

### Claude Code の公式見解
> "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions."

### 推奨対策（各プラットフォーム共通）
1. **具体的・検証可能な指示を書く**（「コードを整形して」→「2スペースインデント」）
2. **矛盾する指示を排除する**
3. **短く保つ**（200行以下推奨 - Claude Code）
4. **Hooksで技術的に強制する**（対応プラットフォームのみ）
5. **権限設定で物理的にブロックする**（permissions.deny等）

---

## aide-powersへの推奨事項

### 現状の仕組み
- `steering/aide-powers-bootstrap.md`（Kiro IDE steering, `inclusion: always`）
- `AGENTS.md`（ワークスペースルート、Codex/Cursor/Copilot向け）
- `skills/using-aide/SKILL.md`（ハブスキル）

### 推奨戦略: 二層アプローチ

#### 第1層: プロンプトレベル（全プラットフォーム共通）

各プラットフォームの「常時適用」ファイルにaide-powersのグローバルルールを配置:

| プラットフォーム | 配置先 | 方法 |
|---|---|---|
| Claude Code | `CLAUDE.md` or `.claude/CLAUDE.md` | `@AGENTS.md` でインポート、またはaide-powers固有ルール追記 |
| Kiro IDE | `.kiro/steering/aide-powers-bootstrap.md` | 現状維持（`inclusion: always`） |
| Cursor | `.cursor/rules/aide-powers.mdc` | `alwaysApply: true` |
| VSCode Copilot | `.github/copilot-instructions.md` | aide-powersルールを含める |
| Gemini CLI | `GEMINI.md` | aide-powersルールを含める |
| Codex CLI / Crush | `AGENTS.md` | 現状維持 |

#### 第2層: 技術的強制（Hooks対応プラットフォーム）

Claude Code と Kiro IDE で Hooks を活用:

```json
// Claude Code: .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "if": "Bash(git commit *)",
          "command": ".claude/hooks/require-user-confirmation.sh"
        }]
      }
    ],
    "Stop": [
      {
        "hooks": [{
          "type": "prompt",
          "prompt": "Check if the agent skipped any required workflow phases. Context: $ARGUMENTS"
        }]
      }
    ]
  }
}
```

```yaml
# Kiro IDE: .kiro/hooks/pre-commit-check.yaml
title: Pre-commit user confirmation
event: Pre Tool Use
tool_name: Bash
file_pattern: ""
action: Run Command
command: "echo 'Commit requires user confirmation' && exit 2"
```

### 具体的な推奨事項

1. **マルチプラットフォーム配布スクリプト**: aide-powersインストール時に各プラットフォームのルールファイルを自動生成するスクリプトを用意
2. **ルールの簡潔化**: 200行以下に収め、具体的・検証可能な表現を使用
3. **Hooks活用**: Claude Code/Kiro IDEでは以下を技術的に強制:
   - `git commit` 前のユーザー確認（PreToolUse + Bash(git commit *)）
   - フェーズ省略検出（Stop hook + prompt型）
   - 設計書なしの実装開始ブロック（PreToolUse + Write/Edit）
4. **AGENTS.md標準の活用**: 60k以上のOSSプロジェクトが採用。aide-powersのAGENTS.mdを充実させることで、Codex/Cursor/Copilot/Gemini CLI/Crushすべてに対応
5. **段階的強制**: 
   - 必須ルール → Hooks（技術的強制）
   - 推奨ルール → CLAUDE.md/steering（プロンプトレベル）
   - 参考情報 → Skills/manual steering（オンデマンド）

---

## リスク

### 技術的リスク
- Hooks機能はClaude Code/Kiro IDEのみ。他プラットフォームでは技術的強制不可
- プロンプトレベルの指示は長いコンテキストで遵守率が低下する
- 各プラットフォームのAPI/仕様変更リスク

### ライセンスリスク
- Crush: FSL-1.1-MIT（商用利用に制限あり、2年後にMIT）
- 他: Apache 2.0 or プロプライエタリ

### 将来の継続性リスク
- AGENTS.md標準: Linux Foundation傘下のAgentic AI Foundationが管理。安定性高い
- OpenCode → Crush: リブランド済み。Charm社が継続開発
- 各プラットフォームのHooks仕様は急速に進化中（破壊的変更の可能性）

---

## 情報源

| ソース | URL | 確認日 |
|---|---|---|
| Claude Code Settings | https://docs.anthropic.com/en/docs/claude-code/settings | 2025-07 |
| Claude Code Memory | https://code.claude.com/docs/en/memory | 2025-07 |
| Claude Code Hooks Reference | https://code.claude.com/docs/en/hooks | 2025-07 |
| Kiro IDE Steering | https://kiro.dev/docs/steering | 2025-07 |
| Kiro IDE Hooks | https://kiro.dev/docs/hooks | 2025-07 |
| Cursor Rules | https://cursor.com/docs/rules | 2025-07 |
| GitHub Copilot Custom Instructions | https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot | 2025-07 |
| Gemini CLI README | https://github.com/google-gemini/gemini-cli | 2025-07 |
| Codex CLI README | https://github.com/openai/codex | 2025-07 |
| AGENTS.md Standard | https://agents.md/ | 2025-07 |
| Crush (旧OpenCode) | https://github.com/charmbracelet/crush | 2025-07 |
