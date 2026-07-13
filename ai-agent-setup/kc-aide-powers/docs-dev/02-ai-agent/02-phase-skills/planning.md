# 企画ワークフローのフェーズスキル

`fs-planning-*` 一覧と各スキルの責務をまとめる。
ワークフロー全体の流れは [`01-workflows/01-planning.md`](../01-workflows/01-planning.md) を参照。

## 一覧

| 順序 | スキル名 | 役割 |
|---|---|---|
| 1 | `fs-planning-phase1-intake-and-init` | 初期ヒアリング・既存資料の構造化・ユーザープロファイル初期判定・session-notes 作成・企画書テンプレート初期化・方向性確認 |
| 2 | `fs-planning-phase2-explore` | 対話 → 技術調査 → 企画書更新 → レビューの探索サイクル。区切り条件に該当したらサイクルレビューを必ず実施 |
| 3 | `fs-planning-phase3-finalize` | 最終レビュー（10 観点 ×5 段階）、ユーザー最終合意、`handover-notes.md` 作成、設計ワークフローへの引き継ぎ |
| 4 | `fs-planning-phase4-final-check` | ワークフロー全体の最終整合性チェック |

## fs-planning-phase1-intake-and-init

### 責務

7 項目の初期ヒアリングを 1 つずつ実施し、ユーザーから提供された資料があれば
`source-material-organizer` サブエージェントに委譲して構造化する。
`user-profile-management` 共通スキルでユーザー技術レベル（3 軸 ×5 段階）を初期判定し、
`proposal-writer-init` サブエージェントで `planning-proposal.md` のテンプレートを初期化する。

### Iron Law の代表ルール

- **NO PHASE SKIPPING**: 定義されたフェーズ順序を厳守する。
- **NO DIRECT ARTIFACT CREATION BY WORKFLOW**: `planning-proposal.md` を直接編集してはならない（メタ情報の `session-notes.md` / `user-profile.md` / 進捗ファイルは例外）。
- **HEARING FIRST. NO AUTONOMOUS DECISIONS**: AI が勝手にアイデアや方針を決定してはならない。必ずユーザーにヒアリングする。
- **NO WORKFLOW SHALL COMPLETE WITHOUT CALLING git-commit-workflow**: ワークフロー完了時に `git-commit-workflow` を呼ばずに終了してはならない。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-planning-phase2-explore`

### 主要な共通スキル呼び出し

`progress-resume-check`（先頭）、`rules-distribute`（skill:deploy / skill:cleanup）、
`user-profile-management`、`doc-index-maintenance`、`git-commit-workflow`。

## fs-planning-phase2-explore

### 責務

`planning-proposal.md` の解像度を上げるために対話 → 技術調査 → 企画書更新 → レビューの
探索サイクルを繰り返す。区切り条件（技術調査一段落 / 複数セクションの大幅更新 / 方向性転換 /
ユーザーの確認希望）に該当したら必ず `proposal-reviewer` サブエージェントによる
サイクルレビュー（8 観点 ×5 段階の総合判定）を実施し、`READY` / `ALMOST` / `NEEDS_WORK` を出す。

### Iron Law の代表ルール

- **NO EXPLORATION CYCLE COMPLETION WITHOUT A REVIEW**: 区切り条件に該当したらレビューをスキップしてはならない。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-planning-phase3-finalize`

### 主要な共通スキル呼び出し

`tech-investigation`（最新情報を必ず確認する 1% ルール対応）、`user-profile-management`、
`doc-index-maintenance`、`git-commit-workflow`、`pending-issues-management`、
`visual-companion`（アーキテクチャ構成図・技術比較表の視覚提示）。

## fs-planning-phase3-finalize

### 責務

10 観点 ×5 段階の最終レビュー（`proposal-reviewer` の `final_review` モード）を実施し、
基準未達の場合はユーザーに探索サイクルへ戻るか進めるかを番号付き選択肢で確認する。
ユーザー最終合意を得たうえで、設計ワークフローへの引き継ぎメモ `handover-notes.md` を
5 セクション（注意点 / 意思決定経緯 / 妥協点 / 未解決課題 / ユーザー所感）で作成する。

### Iron Law の代表ルール

- **NO FINALIZATION WITHOUT HANDOVER-NOTES**: `handover-notes.md` を作成せずにワークフロー完了扱いにしてはならない。設計ワークフローが必ず読み込む引き継ぎメモのため、欠落は致命的。
- 該当なしのセクションも省略せず「該当なし」と明記する。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-planning-phase4-final-check`。完了後、設計ワークフローへ
`planning-proposal.md` / `user-profile.md` / `tech-investigation/` / `source-materials/` /
`handover-notes.md` / `doc-index.md` を引き継ぐ。

### 主要な共通スキル呼び出し

`doc-index-maintenance`、`git-commit-workflow`、`user-profile-management`、`visual-companion`。

## fs-planning-phase4-final-check

### 責務

企画ワークフローの最終フェーズスキル。`progress-final-checker` エージェントが全前フェーズの
署名（PHASE-SIG）を検証し、進捗ファイルの最終フェーズを ✅ 完了 に更新する。
PASS で完了、FAIL なら該当フェーズへ差し戻す。

### REQUIRED SUB-SKILL（次フェーズ）

なし（企画ワークフローの最終フェーズスキル）。

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`（verify）、`progress-final-checker`（エージェント）。
