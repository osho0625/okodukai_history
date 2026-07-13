# 対応方針

## 変更概要

folder-merge-check の Step 4 に「統合先フォルダに残存する前WFの (b)分類成果物を一括退避する」サブステップを追加し、progress-resume-check の ALL_COMPLETED 誤判定を防止する。

## 対応パターン

**パターンA: 通常続行**

理由: 本変更は `skills/folder-merge-check/SKILL.md`（テキストファイル）の Step 4 セクションへの手順追記のみ。OCP原則（コード拡張性）の適用対象外であり、既存手順の前に新しいサブステップを挿入する形で完結する。リファクタリングの余地・必要性はない。

## 変更方針

### 変更対象

| # | ファイル | 変更内容 |
|---|---|---|
| 1 | `skills/folder-merge-check/SKILL.md` | Step 4 セクション内に「前WF (b)分類成果物の一括退避」サブステップを挿入 |

### 変更しないファイル

- `skills/fs-change-phase1-analysis/SKILL.md`（呼び出し元、インターフェース変更なし）
- `skills/fs-bugfix-phase1-analysis/SKILL.md`（同上）
- `skills/fs-refactoring-phase2-candidates/SKILL.md`（同上）
- `skills/progress-resume-check/SKILL.md`（folder-merge-check 側で退避して問題解消）
- `skills/phase-report-check/SKILL.md`（同上）

### 具体的な変更方針

Step 4 の既存処理「移動ルール a/b の同名衝突判定」の**前**に、以下の新サブステップを挿入する（REQ-C-003 の処理順序要件を満たす）。

#### 新サブステップの概要: 「Step 4-事前: 統合先の前WF (b)分類成果物の一括退避」

1. **退避対象の検出**: 統合先フォルダ（`origin_folder_path`）に存在するファイルのうち、既存の Step 4 判定基準で (b)（その時用の設計資料・進捗ファイル）に分類されるものを一括検出する
   - 移動元（`current_dir`）に同名ファイルが存在するか否かは問わない（REQ-C-001 受入基準）
   - 対象例: `delta-design.md`, `change-requirements.md`, `impact-analysis.md`, `approach.md`, `delta-task-list.md`, `impl-process-checklist.md`, `change-progress.md`, `bugfix-progress.md`, `refactoring-progress.md`, `testing/`（フォルダごと）等

2. **退避先の日付決定**: `old/{日付}/` の日付は統合先 `history.md` の最新エントリ日付を用いる
   - `history.md` が存在しない場合・日付が特定できない場合: 進捗ファイル内の最終完了日時を代替に使用する

3. **進捗ファイルの退避判定**（REQ-C-002 固有の条件分岐）:
   - 進捗ファイル（`change-progress.md` / `bugfix-progress.md` / `refactoring-progress.md`）が検出された場合:
     - **全フェーズ✅完了状態** → 無条件で `old/{日付}/` に退避する
     - **未完了状態**（途中フェーズが残っている等）→ ユーザーに状況を報告し、退避許可を得てから退避する（勝手に退避しない）
   - 退避後、今回WFの進捗ファイルは phase-report-check write により新規作成される（前提明記）

4. **退避の実行**: 検出した (b)分類ファイルを全て `old/{日付}/` に移動する
   - `testing/` フォルダが存在する場合はフォルダごと退避（既存の b-2 ルールと同様）

5. **退避完了後**: 統合先がクリーンな状態になったことを確認し、既存の移動ルール（a/b の同名衝突判定）の処理に進む

### 既存処理との関係

- 新サブステップの (b)分類判定基準は、既存 Step 4 の判定基準と**完全に同一**（新しい判定基準の追加なし）
- 新サブステップ完了後に実行される既存の移動ルール（a/b 同名衝突判定）は変更しない
- 入出力インターフェース（Input/Output）に変更なし

## リファクタリング判定

**不要**

理由:
- 変更対象はテキストファイル（SKILL.md）の手順追記のみ
- 構造的な重複や複雑性の問題は存在しない
- 既存の判定基準を再利用する設計であり、新しい概念の導入がない

## テスト方針

aide-powers リポジトリは自動テストフレームワークを導入していない（dev-environment.md §7.4）。

手動検証ポイント:
- 統合先に (b)分類ファイルが残存する状況で folder-merge-check を実行し、退避が正常に行われること
- 進捗ファイルが全フェーズ完了状態の場合、確認なしで退避されること
- 進捗ファイルが未完了状態の場合、ユーザーに確認が求められること
- 退避後の移動ルール（既存 a/b 判定）が正常に動作すること

## リスクと対策

| リスク | 影響 | 対策 |
|---|---|---|
| 退避対象の判定漏れ | 前WFの成果物が統合先に残り続ける | 既存の (b)分類対象例リストを網羅的に適用する |
| history.md 不存在時の日付決定失敗 | old/ のサブフォルダ名が決まらない | 代替手段（進捗ファイル内の最終完了日時）を明記 |
| 未完了進捗ファイルの誤退避 | 中断中のWFの進捗が失われる | 未完了時はユーザー確認必須とする条件分岐で防止 |

## 実装順序

1. `skills/folder-merge-check/SKILL.md` の Step 4 セクション先頭に新サブステップを挿入
2. 完了条件セクションに退避処理の完了条件を追記
