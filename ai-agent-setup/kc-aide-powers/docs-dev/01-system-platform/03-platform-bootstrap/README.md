# 03. プラットフォーム別の起動処理（インデックス）

aide-powers がプラットフォーム起動時にどう「自分の存在」を AI Agent に伝え、ハブスキル（`using-aide-powers`）へ誘導するかをプラットフォーム別に整理する章。

## 1. 起動層の役割

ハブスキルが呼ばれるためには、その手前で「aide-powers が入っている」という事実と「最初に何を読むか」を AI Agent に届ける必要がある。これを担うのが **起動層** であり、プラットフォームごとに異なる仕組みを使う。

起動層に求められる機能は2つだけ。

1. 会話開始時点で **必ず** AI Agent のコンテキストに何かが注入される（受動的に効く）
2. その注入内容に「ハブスキル `using-aide-powers/SKILL.md` を起点にせよ」が含まれている

この2つさえ満たせば、後はハブスキルの初期アクションがすべての面倒を見る（`01-hub-skill-activation.md` 参照）。

## 2. プラットフォーム別の起動機構（一覧）

| プラットフォーム | 起動機構 | 配布物（リポジトリ内） | 詳細ページ |
|---|---|---|---|
| Kiro IDE / Kiro CLI | ステアリング（常時注入の短文 Markdown） | `steering/aide-powers-bootstrap.md` | [kiro.md](./kiro.md) |
| Claude Code | SessionStart hook（プラグイン経由） | `hooks/session-start`、`hooks/hooks.json`、`hooks/run-hook.cmd`、`.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json` | [claude-code.md](./claude-code.md) |
| Cursor | SessionStart hook + `.cursor/rules/` のルール配置 | `hooks/session-start`（同上） | [cursor.md](./cursor.md) |
| GitHub Copilot CLI / VSCode Copilot | グローバルインストラクション + `chat.pluginLocations` 設定 + ハブスキル自動発見 | `instructions/aide-powers.instructions.md`、`skills/`、`hooks/`、`.claude-plugin/` | [copilot.md](./copilot.md) |
| OpenCode | `AGENTS.md` の参照行から `aide-powers-global-rules.agents.md` 経由で誘導 | `AGENTS.md` | [opencode.md](./opencode.md) |
| Gemini CLI | `GEMINI.md` の `@import` 行（プロジェクトルート） | `GEMINI.md`、`gemini-extension.json` | [gemini.md](./gemini.md) |
| Codex | `AGENTS.md` の参照行 + `~/.agents/skills/` のスキル | `AGENTS.md` | [codex.md](./codex.md) |

**注:** `hooks/` ディレクトリには上記の起動層ファイル以外に、Kiro IDE 専用の hook ファイル（例: `hooks/brainstorm-selection.json`）が含まれる場合がある。これらは aide-powers の起動層とは無関係の補助機能であり、Kiro IDE の hook 機構（fileCreated トリガー等）で個別に発火する。

## 3. 全体図

```mermaid
flowchart TB
    subgraph KIRO[Kiro IDE / Kiro CLI]
        K1[steering/<br/>aide-powers-bootstrap.md]
    end
    subgraph CC[Claude Code / Cursor]
        C1[hooks/hooks.json]
        C2[hooks/session-start]
        C3[hooks/run-hook.cmd]
        C4[.claude-plugin/plugin.json]
        C5[.claude-plugin/marketplace.json]
        C1 --> C2
        C3 --> C2
    end
    subgraph CP[GitHub Copilot CLI / VSCode]
        P1[instructions/<br/>aide-powers.instructions.md]
    end
    subgraph GM[Gemini CLI]
        G1[GEMINI.md<br/>@import]
        G2[gemini-extension.json]
    end
    subgraph CDX[Codex / OpenCode]
        X1[AGENTS.md]
        X2[aide-powers-global-rules.agents.md]
        X1 --> X2
    end

    HUB[using-aide-powers SKILL.md<br/>= aide-powers-guide SKILL.md]
    KIRO -->|常時注入| HUB
    CC -->|SessionStart で全文注入| HUB
    CP -->|常時指示で誘導| HUB
    GM -->|@import で読み込み| HUB
    CDX -->|参照行で誘導| HUB
```

## 4. 起動層に共通するパターン

具体は異なるが、以下の3パターンのいずれかに収まる。

| パターン | 仕組み | 採用プラットフォーム |
|---|---|---|
| ① 常時注入型 | プラットフォーム機構が会話冒頭に短い指示文を必ず差し込む | Kiro IDE（steering）、GitHub Copilot（instructions） |
| ② フック型 | SessionStart 等のフック実行で、ハブスキル本体の全文をコンテキストに注入する | Claude Code、Cursor |
| ③ ファイル参照型 | プロジェクトルートのドキュメント（GEMINI.md / AGENTS.md）から `@import` や参照行で読み込ませる | Gemini CLI、Codex、OpenCode |

セットアップスクリプト（`setup.bat` / `setup.sh`）は、選択されたプラットフォームに対応する起動層の配置をまとめて行う。

## 5. 共通の到達点

どのパターンを通っても、最終的な到達点は同じ。
- ハブスキル `using-aide-powers/SKILL.md` の指示が AI Agent のコンテキストに乗っている
- AI Agent が「最初にやるのは STEP 1〜3 の初期アクション」を認識している
- そこから Quick Routing でフェーズスキルが選ばれる

つまり起動層は「ハブスキルへの確実な引き渡し」だけを担当し、それ以降の判断・実行はハブスキルに委ねる。起動層を薄く保つことで、新プラットフォーム追加時の作業を「ハブスキルへの誘導ファイルを1つ用意する」だけに留められる。

### 5.1 ハブスキル名のプラットフォーム別差異

ハブスキルの実体は同一だが、プラットフォームのスキル発見仕様に合わせて2つの名前で配布されている。

| スキル名 | 使用プラットフォーム | 理由 |
|---|---|---|
| `using-aide-powers` | Kiro IDE / Kiro CLI / Claude Code / Cursor / Gemini CLI | Claude Code のスキル機構（`Skill` ツール）および Kiro の `discloseContext` で使用 |
| `aide-powers-guide` | GitHub Copilot CLI / VSCode Copilot / Codex | Copilot のスキル自動発見・description ベースの呼び出しに最適化。description に CRITICAL プレフィックスを付与し、スキル呼び出しの確度を高めている |

`using-aide-powers` は Kiro / Claude Code / Cursor / Gemini CLI で SessionStart hook やステアリング経由で直接注入される。`aide-powers-guide` は Copilot / Codex のスキル自動発見機構（description を読んで呼び出しを判断する仕組み）に最適化した、より詳細な description を持つ別ファイルとして存在する。

内容は同一のワークフローへ誘導するが、スキル内部で参照する配置パスが異なる（`using-aide-powers` は `~/.kiro/skills/` や `~/.claude/skills/`、`aide-powers-guide` は `~/.copilot/skills/` を参照する）。

## 6. プラットフォーム別の詳細ページ

各プラットフォームの起動シーケンスと配置物の詳細は下記を参照する。各ページは「インストール先パス」「起動メカニズム」「ルール配置先」「特殊事項」を共通フォーマットで記載している。

| ページ | 内容 |
|---|---|
| [kiro.md](./kiro.md) | Kiro IDE / Kiro CLI のステアリング動作とブートストラップ詳細 |
| [claude-code.md](./claude-code.md) | Claude Code の SessionStart hook、`hooks.json` の発火条件、`additionalContext` 注入の JSON 形式 |
| [cursor.md](./cursor.md) | Cursor の hook 互換性、`additional_context`（snake_case）注入と `.cursor/rules/` のルール配置 |
| [copilot.md](./copilot.md) | Copilot CLI / VSCode Copilot の instructions 機構と `chat.pluginLocations` / `chat.hookFilesLocations` 設定 |
| [opencode.md](./opencode.md) | OpenCode の `AGENTS.md` 経由ブートストラップ |
| [gemini.md](./gemini.md) | Gemini CLI のエクステンション機構と `GEMINI.md` `@import` |
| [codex.md](./codex.md) | Codex の `~/.agents/skills/` 配置と `AGENTS.md` 誘導 |

## 7. 章境界の確認

- 起動層から先（ワークフロー実行）は **第2章（02-ai-agent/）** が扱う。
- 新プラットフォームを追加する手順は **第3章（03-how-to/）** が扱う。
- 本ページは「起動層が何をしているか」までに留める。
