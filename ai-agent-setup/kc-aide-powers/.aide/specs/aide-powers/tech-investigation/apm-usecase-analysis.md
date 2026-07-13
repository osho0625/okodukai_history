# APM 対応 ユースケース分析

> 作成日: 2026-06-16
> ステータス: レビュー中

---

## 設計前提

### 制約

1. `apm run` は OS のシェルでコマンドを実行する（Win→cmd、Linux→bash）
2. `setup-local.bat` / `setup-local.sh` は現状対話式（番号入力待ち）→ 引数モード追加が必要
3. APM の Kiro ターゲットは agents 未サポート → `apm run` + setup スクリプトで全配置をカバー
4. 対象 OS: Win11 ネイティブ / WSL Ubuntu

### 採用方式

- **OS 別スクリプト名方式**: `setup-kiro-win` / `setup-kiro-linux` のように分ける
- **引数モード追加**: `setup-local.bat . 1` のように第2引数でプラットフォーム番号を渡し、対話スキップ
- **プロジェクト構造は変更しない**: `.apm/` への移行不要

### apm.yml 設計

```yaml
name: aide-powers
version: 1.0.0
description: AI Agent document-driven development framework
author: KC Developer Team

scripts:
  # Windows (cmd)
  setup-kiro-win: "setup-local.bat . 1"
  setup-claude-win: "setup-local.bat . 2"
  setup-copilot-win: "setup-local.bat . 3"
  setup-all-win: "setup-local.bat . 4"
  # Linux / WSL (bash)
  setup-kiro-linux: "./setup-local.sh . 1"
  setup-claude-linux: "./setup-local.sh . 2"
  setup-copilot-linux: "./setup-local.sh . 3"
  setup-all-linux: "./setup-local.sh . 4"
```

---

## 利用者の分類

| ID | 利用者 | OS | 使うプラットフォーム |
|---|---|---|---|
| U1 | 社内開発者 | Win11 ネイティブ | Kiro IDE, Claude Code, VSCode Copilot |
| U2 | 社内開発者 | WSL Ubuntu | Kiro CLI, Claude Code, VSCode Copilot |

---

## ユースケース一覧

| UC# | 利用者 | 目的 |
|---|---|---|
| UC-0a | U1 | APM CLI をインストールしたい（Win11） |
| UC-0b | U2 | APM CLI をインストールしたい（WSL Ubuntu） |
| UC-1 | U1 | 新規プロジェクトで Kiro IDE 用に aide-powers をセットアップしたい |
| UC-2 | U1 | 新規プロジェクトで Claude Code 用に aide-powers をセットアップしたい |
| UC-3 | U1 | 新規プロジェクトで VSCode Copilot 用に aide-powers をセットアップしたい |
| UC-4 | U1 | 新規プロジェクトで全プラットフォーム一括セットアップしたい |
| UC-5 | U2 | 新規プロジェクトで Kiro CLI 用に aide-powers をセットアップしたい |
| UC-6 | U2 | 新規プロジェクトで Claude Code 用に aide-powers をセットアップしたい |
| UC-7 | U2 | 新規プロジェクトで VSCode Copilot 用に aide-powers をセットアップしたい |
| UC-8 | U2 | 新規プロジェクトで全プラットフォーム一括セットアップしたい |
| UC-9 | U1 | aide-powers を最新版に更新してプロジェクトに反映したい |
| UC-10 | U2 | aide-powers を最新版に更新してプロジェクトに反映したい |
| UC-11 | U1/U2 | aide-powers 以外のスキルや MCP サーバーも APM で一元管理したい |
| UC-12 | U1 | aide-powers をプロジェクトから除去したい |
| UC-13 | U2 | aide-powers をプロジェクトから除去したい |

---

## UC 実現プロセス

### UC-0a: Win11 に APM CLI をインストール

| Step | 操作 | 結果 |
|---|---|---|
| 1 | PowerShell を開く | — |
| 2 | `irm https://aka.ms/apm-windows \| iex` | APM CLI が `%LOCALAPPDATA%\Programs\apm\bin` にインストールされ PATH に追加 |
| 3 | `apm --version` | バージョンが表示されれば成功 |

**代替手段:**
- Scoop: `scoop bucket add apm https://github.com/microsoft/scoop-apm` → `scoop install apm`
- pip: `pip install apm-cli`（Python 3.10+ 必要）

### UC-0b: WSL Ubuntu に APM CLI をインストール

| Step | 操作 | 結果 |
|---|---|---|
| 1 | ターミナルを開く | — |
| 2 | `curl -sSL https://aka.ms/apm-unix \| sh` | APM CLI が `/usr/local/bin/apm` にインストール |
| 3 | `apm --version` | バージョンが表示されれば成功 |

**代替手段:**
- Homebrew: `brew install microsoft/apm/apm`
- pip: `pip install apm-cli`（Python 3.10+ 必要）

**注意:**
- git が必要（依存管理で使用）
- 社内プロキシ環境の場合、git の proxy 設定が必要（`git config --global http.proxy http://proxy:port`）

---

### UC-1: Win11 + Kiro IDE セットアップ

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm install http://10.110.47.117/takashi/aide-claude` | aide-powers が `apm_modules/` にクローン |
| 2 | `apm run setup-kiro-win` | `setup-local.bat . 1` 実行 → `.kiro/skills/`, `.kiro/agents/`, `.kiro/steering/` に配置 |
| 3 | Kiro IDE 再起動 | aide-powers が有効化 |

### UC-2: Win11 + Claude Code セットアップ

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm install http://10.110.47.117/takashi/aide-claude` | 同上 |
| 2 | `apm run setup-claude-win` | `setup-local.bat . 2` 実行 → `skills/`, `agents/`, `hooks/`, `.claude-plugin/`, `.claude/rules/` に配置 |
| 3 | Claude Code 再起動 | aide-powers が有効化 |

### UC-3: Win11 + VSCode Copilot セットアップ

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm install http://10.110.47.117/takashi/aide-claude` | 同上 |
| 2 | `apm run setup-copilot-win` | `setup-local.bat . 3` 実行 → `.github/skills/`, `.github/hooks/`, `.github/instructions/` に配置 |
| 3 | VSCode 再起動 | aide-powers が有効化 |

### UC-4: Win11 全プラットフォーム一括

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm install http://10.110.47.117/takashi/aide-claude` | 同上 |
| 2 | `apm run setup-all-win` | `setup-local.bat . 4` 実行 → 全プラットフォーム分を配置 |
| 3 | 各 IDE/CLI 再起動 | 全プラットフォームで有効化 |

### UC-5: WSL Ubuntu + Kiro CLI セットアップ

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm install http://10.110.47.117/takashi/aide-claude` | 同上 |
| 2 | `apm run setup-kiro-linux` | `./setup-local.sh . 1` 実行 → `.kiro/skills/`, `.kiro/agents/`, `.kiro/steering/` に配置 |
| 3 | Kiro CLI で確認 | aide-powers が有効化 |

### UC-6: WSL Ubuntu + Claude Code セットアップ

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm install http://10.110.47.117/takashi/aide-claude` | 同上 |
| 2 | `apm run setup-claude-linux` | `./setup-local.sh . 2` 実行 → 同上 |
| 3 | Claude Code 再起動 | aide-powers が有効化 |

### UC-7: WSL Ubuntu + VSCode Copilot セットアップ

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm install http://10.110.47.117/takashi/aide-claude` | 同上 |
| 2 | `apm run setup-copilot-linux` | `./setup-local.sh . 3` 実行 → `.github/skills/`, `.github/hooks/`, `.github/instructions/` に配置 |
| 3 | VSCode 再起動 | aide-powers が有効化 |

### UC-8: WSL Ubuntu 全プラットフォーム一括

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm install http://10.110.47.117/takashi/aide-claude` | 同上 |
| 2 | `apm run setup-all-linux` | `./setup-local.sh . 4` 実行 → 全配置 |
| 3 | 各 CLI/IDE 再起動 | 全プラットフォームで有効化 |

---

## UC-9/UC-10: aide-powers の更新と反映

### UC-9: 単純更新（Win11）

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm update` | `apm_modules/` 内の aide-powers を最新コミットに更新 |
| 2 | `apm run setup-kiro-win` | setup-local.bat が実行。既存ファイルを上書き。旧構造クリーンアップも実行 |
| 3 | IDE 再起動 | 最新版で動作。using-aide-powers の起動時に version.json 比較 → references 自動更新 |

### UC-10: 単純更新（WSL Ubuntu）

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm update` | 同上 |
| 2 | `apm run setup-kiro-linux` | setup-local.sh が実行。同上 |
| 3 | 再起動 | 同上 |

### チーム全体への一斉更新（UC-9/10 共通パターン）

| Step | 操作 | 実施者 |
|---|---|---|
| 1 | 消費者プロジェクトの `apm.yml` で ref を更新（例: `#v1.1.0`） | チームリード |
| 2 | コミット & push | チームリード |
| 3 | 各メンバーが `git pull` → `apm install` → `apm run setup-*-{os}` | 各メンバー |

### 破壊的更新（スキル名変更・廃止あり、UC-9/10 共通パターン）

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm update` | 最新取得 |
| 2 | `apm run setup-kiro-win` | setup-local.bat の `cleanup_legacy_skills` で旧フェーズスキルを削除 → 最新を上書き |
| 3 | 廃止スキルが `.kiro/skills/` から除去されている | 残骸なし |

### 更新時の整合性メカニズム

| 仕組み | 何をするか | 自動/手動 |
|---|---|---|
| `cleanup_legacy_skills` | 旧ワークフロー構造・廃止フェーズスキルを削除 | 自動（setup-local 実行時） |
| `version.json` 比較 | using-aide-powers 起動時に正本と .aide/references/ を比較、差があれば全コピー | 自動（AI Agent 起動時） |
| `rules-distribute` | 更新された references をプラットフォームのルール置き場に再配布 | 自動（AI Agent 起動時） |
| agents クリーンアップ | 廃止されたエージェント定義の除去 | **要追加**: 配置前に .kiro/agents/ をクリア |

---

## UC-11: 他のスキルや MCP サーバーも APM で一元管理したい

### 背景

aide-powers 以外にも、プロジェクト固有のスキルや MCP サーバーを使いたい。APM の `dependencies` で全て宣言し、`apm install` 一発で環境が揃うようにしたい。

### 消費者側 apm.yml の例

```yaml
name: my-project
version: 1.0.0

targets:
  - kiro
  - claude

dependencies:
  apm:
    - 10.110.47.117/takashi/aide-claude#v1.0.0
    - 10.110.47.117/team/custom-review-skills#main
  mcp:
    - io.github.github/github-mcp-server
    - name: internal-db-server
      registry: false
      transport: stdio
      command: ./bin/db-mcp-server
      env:
        DB_URL: ${DB_URL}

scripts:
  setup-kiro-win: "apm_modules/aide-claude/setup-local.bat . 1"
  setup-kiro-linux: "./apm_modules/aide-claude/setup-local.sh . 1"
  setup-all-win: "apm_modules/aide-claude/setup-local.bat . 4"
  setup-all-linux: "./apm_modules/aide-claude/setup-local.sh . 4"
```

### 実現プロセス

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm.yml` に aide-powers + 他スキル + MCP を宣言 | 依存の一元宣言 |
| 2 | `apm install` | aide-powers と他スキルが `apm_modules/` にクローン。MCP サーバー設定が `.kiro/settings/mcp.json` 等に書き出される |
| 3 | `apm run setup-kiro-{os}` | aide-powers のローカルセットアップ実行（APM 未対応の agents 等を配置） |
| 4 | 他スキルは APM が自動配置（skills は kiro native サポート） | `.kiro/skills/` に配置済み |
| 5 | IDE/CLI 再起動 | 全スキル + MCP サーバーが利用可能 |

### ポイント

- **aide-powers**: APM の agents 未サポートのため `apm run` で補完が必要
- **他スキル（skills のみのパッケージ）**: APM が `.kiro/skills/` に自動配置するので `apm install` だけで済む
- **MCP サーバー**: APM が `.kiro/settings/mcp.json` に自動書き出し
- **混在管理**: 1つの `apm.yml` で全てを宣言し、`apm install` + `apm run setup-*` の2コマンドで環境構築完了

---

## UC-12/UC-13: アンインストール

### UC-12: Win11 でアンインストール

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm uninstall aide-powers` | `apm_modules/` から削除、`apm.yml` から依存除去 |
| 2 | 配置済みファイルの削除（手動 or cleanup スクリプト） | `.kiro/skills/`, `.kiro/agents/` 等から除去 |

### UC-13: WSL Ubuntu でアンインストール

| Step | 操作 | 結果 |
|---|---|---|
| 1 | `apm uninstall aide-powers` | 同上 |
| 2 | 配置済みファイルの削除（手動 or cleanup スクリプト） | 同上 |

**注意**: `apm uninstall` は配置済みファイルを自動削除するかは未確認。setup-local で配置したファイルは APM のロックファイルに `deployed_files` として記録されていないため、手動削除が必要になる可能性が高い。

---

## 必要な実装変更まとめ

| # | 変更対象 | 内容 |
|---|---|---|
| 1 | `setup-local.bat` | 第2引数でプラットフォーム番号を受け取り、対話スキップする分岐追加 |
| 2 | `setup-local.sh` | 同上 |
| 3 | 新規: `apm.yml` | ルートに作成、scripts 定義（OS別 × プラットフォーム別） |
| 4 | `setup-local.bat/sh` | agents 配置前に `.kiro/agents/` をクリアする処理追加（廃止エージェント残骸防止） |

---

## 未解決事項（解決済み）

| # | 課題 | 結論 |
|---|---|---|
| 1 | `apm run` のスクリプトは消費者の CWD で実行されるか | **Yes**。消費者のプロジェクトルートで実行される。`apm_modules/` 内のスクリプトを参照するには相対パス（`apm_modules/aide-claude/setup-local.bat`）を使う。ただし消費者側の `apm.yml` にスクリプトを定義する方式が自然 |
| 2 | `apm uninstall` が配置済みファイルを自動削除するか | ロックファイルに `deployed_files` が記録される。`apm install` が配置したファイルは `apm uninstall` で削除される。**ただし `apm run` で配置したファイル（setup-local 経由）はロックファイルに記録されないため、手動削除が必要** |
| 3 | APM の Kiro agents 対応が将来実装された場合 | 現時点では対応不要。実装された時点で `apm run` による補完を廃止し、ネイティブ配置に移行すればよい |

## 設計上の重要な気付き

`apm run` は**プロンプト実行用のランナー**であり、セットアップスクリプト実行は本来の想定用途ではない。ただし「literal shell command」として何でも実行できるため、setup-local の呼び出しにも使える。

**2つの `apm.yml` の関係:**

| ファイル | 用途 |
|---|---|
| aide-powers リポジトリの `apm.yml` | パッケージのメタデータ。`apm install` 時に APM が読む |
| 消費者プロジェクトの `apm.yml` | 依存宣言 + scripts。消費者が `apm run` で使う |

aide-powers 側の `apm.yml` に `scripts:` を書いても、それが消費者側で自動的に使えるわけではない。消費者が自分の `apm.yml` に scripts を定義するか、aide-powers のスクリプトを直接パスで呼ぶ必要がある。
