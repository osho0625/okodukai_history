# 00. aide-powers 概要

aide-powers の全体像を 1 ページで把握するための入口ドキュメントである。本書は機能概要と各章への導線のみを扱い、機構の動作原理・スキル個別仕様・拡張手順には深入りしない。詳細は末尾「他章への導線」から各章へ進むこと。

## 1. aide-powers とは何か

aide-powers は、AI Agent によるドキュメント駆動開発を高度化するためのフレームワークである。スキル群（`skills/`）、共通エージェント定義（`agents/`）、ルール定義、配布スクリプトで構成され、配布単位は単一のリポジトリである。

aide-powers は単独で動くアプリケーションではなく、AI Agent プラットフォーム上で AI Agent の振る舞いを規定するルールセットである。`git clone` 後に `setup.bat` / `setup.sh` を実行することで、各プラットフォームのグローバルエリア（`~/.kiro/`, `~/.claude/`, `~/.copilot/` 等）またはプロジェクトリポジトリのローカル領域に配布される。

## 2. 何を解決するか

AI Agent は「アプリ作って」と指示するだけで動くコードを生成できるが、生成物はしばしばユーザーの期待と乖離する。要件の取りこぼし、設計の薄さ、エラーハンドリングの欠落、エッジケース未考慮、テスト不足。コードは動くが、ユーザーが本当に欲しかったものではない、という状態が起きる。

aide-powers はこの「動くが期待と違う」問題を、要件定義 → 設計 → 実装 → レビューの工程を AI Agent に強制することで解決する。中核となる解決アプローチは次の 3 点である（機構詳細は [第1章 01-system-platform/00-architecture.md](./01-system-platform/00-architecture.md) 参照）。

- **ハブスキル方式** — 会話開始時に必ずハブスキルを起点に読み込み、Quick Routing でエントリポイントスキルへ確実に導く
- **7ワークフローへの分割** — 開発プロセスをフェーズスキル（`fs-*`）の連鎖として 7 種類のワークフローに分割し、ワークフロー本体は管理・委譲・対話のみを担う
- **プラットフォーム別ルール配布** — グローバルルールを各プラットフォームのルールファイル機構に直接配置し、AI Agent が自動でルールを参照できる状態を作る

## 3. 構成要素の俯瞰

aide-powers リポジトリは、AI Agent の振る舞いを規定する中核資産（`skills/` のスキル群、`agents/` の共通エージェント定義の計 8 名 = QAレビューアーエージェント 5 名 + 実装系エージェント 3 名）と、各プラットフォームへ展開するためのブートストラップ・配布スクリプト群で構成される。配布物の内訳・各フォルダの責務・命名規則は [第1章 01-system-platform/06-execution-units.md](./01-system-platform/06-execution-units.md) を参照。

## 4. 7 つのワークフロー

aide-powers は次の 7 種類のワークフローを提供する。各ワークフローはエントリポイントスキルから始まり、フェーズスキルの連鎖で構成される。フェーズ構成・QAゲート・設計書ゲートの詳細は [第2章 02-ai-agent/01-workflows/00-overview.md](./02-ai-agent/01-workflows/00-overview.md) を参照。

| ワークフロー | 用途 | エントリポイントスキル |
|---|---|---|
| 企画ワークフロー | アイデア → 企画書 | `fs-planning-phase1-intake-and-init` |
| 設計ワークフロー | 要件 → 設計書一式 | `fs-design-phase1-user-req` |
| 実装ワークフロー | 設計書 → コード | `fs-impl-phase1-gate` |
| 設計逆引きワークフロー | 既存コード → 設計書 | `fs-reverse-phase1-program` |
| 変更ワークフロー | 機能追加・仕様変更 | `fs-change-phase1-analysis` |
| リファクタリングワークフロー | 内部構造改善（振る舞い不変） | `fs-refactoring-phase1-status` |
| バグ修正ワークフロー | バグ再現 → 原因分析 → 修正 | `fs-bugfix-phase1-analysis` |

## 5. 対応プラットフォーム

aide-powers は以下のプラットフォームで動作する。プラットフォームごとの動作方式・配置先・ツール名差分の吸収方法は [第1章 01-system-platform/02-multiplatform.md](./01-system-platform/02-multiplatform.md) を、プラットフォーム別のブートストラップ詳細は [第1章 01-system-platform/03-platform-bootstrap/](./01-system-platform/03-platform-bootstrap/) を参照。

| プラットフォーム | 詳細リンク |
|---|---|
| Claude Code | [03-platform-bootstrap/claude-code.md](./01-system-platform/03-platform-bootstrap/claude-code.md) |
| Kiro IDE / Kiro CLI | [03-platform-bootstrap/kiro.md](./01-system-platform/03-platform-bootstrap/kiro.md) |
| Cursor | [03-platform-bootstrap/cursor.md](./01-system-platform/03-platform-bootstrap/cursor.md) |
| OpenCode | [03-platform-bootstrap/opencode.md](./01-system-platform/03-platform-bootstrap/opencode.md) |
| GitHub Copilot（CLI / VSCode） | [03-platform-bootstrap/copilot.md](./01-system-platform/03-platform-bootstrap/copilot.md) |
| Gemini CLI | [03-platform-bootstrap/gemini.md](./01-system-platform/03-platform-bootstrap/gemini.md) |
| Codex | [03-platform-bootstrap/codex.md](./01-system-platform/03-platform-bootstrap/codex.md) |

## 6. 開発者向けドキュメントの読み方

本ドキュメント群（`docs-dev/`）は aide-powers の開発引き継ぎ者向けに、以下の 3 章で構成される。本書（00-overview）は導入であり、深入りはしない。章境界は厳格である。

| 章 | 責務 | 主な対象読者の関心 |
|---|---|---|
| [01-system-platform](./01-system-platform/) | aide-powers がプラットフォーム上で動作するための機構 | 配布物の構造、ハブスキル起動、マルチプラットフォーム対応、ルール配布、スキルマップ |
| [02-ai-agent](./02-ai-agent/) | AI Agent が aide-powers を使って実行する開発プロセス | 7ワークフロー、フェーズスキル、共通スキル、共通エージェントの責務分担、Iron Law と Red Flags |
| [03-how-to](./03-how-to/) | aide-powers 自体を拡張・保守する手順 | ワークフロー追加、フェーズスキル追加、共通スキル追加、共通エージェント追加、リリース |

ドキュメント全体で使用する用語の正式名称・定義は `.aide/specs/aide-powers/ubiquitous-language.md` に集約されている。執筆・改訂時は同辞書を起点に表記揺れを統一すること。

---

## 他章への導線

- [第1章 システム・プラットフォーム編](./01-system-platform/) — 配布物の構造、各プラットフォームへのインストール方式、ハブスキル起動機構、ツールマップ、ルール配布機構（`rules-distribute`）の詳細
- [第2章 AI Agent 編](./02-ai-agent/) — ハブスキル方式の動作原理、7ワークフローの詳細、フェーズスキルと共通スキルの設計、共通エージェントの責務分担、Iron Law と Red Flags の運用ルール
- [第3章 開発手順編](./03-how-to/) — フェーズスキル追加（[add-phase-skill](./03-how-to/add-phase-skill.md)）、共通スキル追加（[add-common-skill](./03-how-to/add-common-skill.md)）、共通エージェント追加（[add-agent](./03-how-to/add-agent.md)）、ワークフロー新設（[add-workflow](./03-how-to/add-workflow.md)）、リリース手順（[release](./03-how-to/release.md)）
