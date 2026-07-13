# タスクトレイ管理アプリ 企画書アーカイブ

aide-powers のドキュメント再整備（doc-reorganization プロジェクト）に伴い、
タスクトレイ管理アプリの企画・設計に関する資料一式をここに退避・保存しています。

## 背景

aide-powers は当初、社内展開用の「タスクトレイ管理アプリ」（aide-powers プラグイン本体を
GUI で配布・管理する Windows 常駐アプリ）の企画として進められ、企画書・要件定義・設計書
（GUI / レイヤードアーキテクチャ / オブジェクト設計 / インフラIF など）まで作成されていました。

その後 aide-powers は「AI Agent 向けドキュメント駆動開発フレームワーク」として独立して
開発が進み、現在の skills/ + agents/ + setup スクリプト方式に到達しています。

タスクトレイ管理アプリの企画は現時点で休止中ですが、将来再開する可能性があるため、
ドキュメント再整備のタイミングで `old/` 配下から救出し、独立した企画書アーカイブとして
ここに集約しました。

## 構成

| フォルダ | 内容 |
|---|---|
| `.aide-side/` | `old/.aide/specs/aide-powers/` 配下にあったタスクトレイ管理アプリ関連ドキュメント |
| `.kiro-side/` | `old/.kiro/specs/aide-powers/` 配下にあったタスクトレイ管理アプリ関連ドキュメント |

`.aide-side` と `.kiro-side` は同じ企画の異なるバージョンの可能性があります（中身の差異は
未検証）。再開時には両者を比較し、必要に応じて統合・整理してください。

## 主要ドキュメント（両サイド共通）

- `planning-proposal.md` — 開発企画書（タスクトレイ管理アプリの全体像）
- `handover-notes.md` — 引き継ぎメモ
- `session-notes.md`, `session-context.md`, `session-handover-*.md` — セッション履歴
- `user-requirements.md`, `system-requirements.md` — 要件定義
- `development-plan.md`, `dev-environment.md` — 開発計画・環境
- `system-architecture.md`, `gui-design.md`, `layered-architecture.md` — アーキテクチャ・GUI設計
- `infra-interface-design.md` — インフラインターフェース設計
- `object-design-{domain,application,infrastructure,presentation}.md` — レイヤー別オブジェクト設計
- `ubiquitous-language.md` — ユビキタス言語辞書
- `program-structure.md` — プログラム構成
- `poc-plan.md`, `poc-framework-analysis.md` — PoC 計画・フレームワーク分析
- `usecases/` — ユースケース分析（`usecase-tray-app.md` 等）
- `tech-investigation/` — 技術調査（`09-tray-app-tech-stack.md` 等）
- `doc-index.md`, `planning-progress.md`, `progress.md`, `pending-issues.md`, `user-profile.md` — メタ情報

## 取り扱い

- このアーカイブは aide-powers ドキュメント再整備プロジェクトのスコープ外です
- aide-powers 本体（skills/、agents/、setup.bat など）の開発・運用には影響しません
- 将来タスクトレイ管理アプリの企画を再開する場合は、ここを起点として再評価してください
