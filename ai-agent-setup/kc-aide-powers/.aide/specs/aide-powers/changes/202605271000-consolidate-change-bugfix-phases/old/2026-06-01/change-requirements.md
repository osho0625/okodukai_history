# 変更要求定義

## 変更概要

### 目的・背景

変更WF（現在10フェーズ）とバグ修正WF（現在7フェーズ）のフェーズスキル数を各3つに統合し、ワークフロー実行時のコンテキスト消費（前処理・後処理の繰り返し）を削減する。各フェーズの「やること」自体は変えず、スキルファイルの統合のみ行う。

### 変更種別

仕様変更（modification）

---

## 要求事項

### REQ-C-001: 変更WFのフェーズスキルを3つに統合する

- 種別: 仕様変更
- 説明: 現在10フェーズの変更WFを以下の3フェーズに統合する
  - Phase 1（分析・計画）: 旧Phase 1〜4（設計書ゲート + 要件定義 + 影響分析 + 方針策定）
  - Phase 2（設計・実装・完了処理）: 旧Phase 5〜9（差分設計 + 影響再検討 + タスク計画 + 実装 + 完了処理）
  - Phase 3（最終整合性チェック）: 旧Phase 10（現状と同じ役割）
- 受入基準:
  1. `fs-change-phase1-analysis/SKILL.md` が作成され、旧Phase 1〜4の全Step内容が漏れなく含まれている
  2. `fs-change-phase2-impl/SKILL.md` が作成され、旧Phase 5〜9の全Step内容が漏れなく含まれている
  3. `fs-change-phase3-final-check/SKILL.md` が作成され、旧Phase 10の内容が現状と同じ役割で含まれている
  4. 各スキルの前処理・後処理はフェーズ全体で1回ずつのみ
  5. 旧フェーズの注意事項（Iron Law, Red Flags, Common Rationalizations）が関連Stepの近くに配置されている
  6. 複数旧フェーズに共通する注意事項は重複なく1箇所に整理されている
- 優先度: Must

### REQ-C-002: バグ修正WFのフェーズスキルを3つに統合する

- 種別: 仕様変更
- 説明: 現在7フェーズのバグ修正WFを以下の3フェーズに統合する
  - Phase 1（分析・計画）: 旧Phase 1〜3（バグ報告 + 原因分析 + 修正方針）
  - Phase 2（設計・実装・ドキュメント反映）: 旧Phase 4〜6（差分設計 + 実装 + ドキュメント反映）
  - Phase 3（最終整合性チェック）: 旧Phase 7（現状と同じ役割）
- 受入基準:
  1. `fs-bugfix-phase1-analysis/SKILL.md` が作成され、旧Phase 1〜3の全Step内容が漏れなく含まれている
  2. `fs-bugfix-phase2-impl/SKILL.md` が作成され、旧Phase 4〜6の全Step内容が漏れなく含まれている
  3. `fs-bugfix-phase3-final-check/SKILL.md` が作成され、旧Phase 7の内容が現状と同じ役割で含まれている
  4. 各スキルの前処理・後処理はフェーズ全体で1回ずつのみ
  5. 旧フェーズの注意事項が関連Stepの近くに配置されている
  6. 複数旧フェーズに共通する注意事項は重複なく1箇所に整理されている
- 優先度: Must

### REQ-C-003: progress-file-format.md を更新する

- 種別: 仕様変更
- 説明: §7.5（変更WF）と §7.6（バグ修正WF）のフェーズマッピングを新しい3フェーズ構成に更新する
- 受入基準:
  1. §7.5 が3フェーズ（fs-change-phase1-analysis, fs-change-phase2-impl, fs-change-phase3-final-check）に更新されている
  2. §7.6 が3フェーズ（fs-bugfix-phase1-analysis, fs-bugfix-phase2-impl, fs-bugfix-phase3-final-check）に更新されている
- 優先度: Must

### REQ-C-004: using-aide-powers 関連ファイルを更新する

- 種別: 仕様変更
- 説明: using-aide-powers/SKILL.md およびその references/ 配下のファイルで、変更WF・バグ修正WFのフェーズ一覧・遷移先スキル名を新しい3フェーズ構成に更新する
- 受入基準:
  1. ワークフロー選択ガイドのエントリポイントスキル名が更新されている
  2. フェーズ遷移の記述が新スキル名に更新されている
- 優先度: Must

### REQ-C-005: 旧フェーズスキルを削除する

- 種別: 仕様変更
- 説明: 統合により不要になった旧フェーズスキルディレクトリを削除する
- 受入基準:
  1. 変更WF: fs-change-phase1-status 〜 fs-change-phase10-final-check の全10ディレクトリが削除されている
  2. バグ修正WF: fs-bugfix-phase1-report 〜 fs-bugfix-phase7-final-check の全7ディレクトリが削除されている
- 優先度: Must

---

### REQ-C-006: セッション履歴のStep単位書き出しによるcompliance-check改善

- 種別: 仕様変更
- 説明: 全フェーズスキル（変更WF・バグ修正WFに限らず全7WF）において、各Stepの実行完了時にそのStepに関するやり取りをファイルに書き出し、後処理でcompliance-checkerに渡す方式に変更する。これにより従来の「セッション履歴全文エクスポート」の技術的困難を解消する。
- 受入基準:
  1. 各Stepの実行完了時に `.aide/tmp/session-history-{フェーズスキル名}-step{N}.txt` が書き出される
  2. 前処理の実行完了時に `.aide/tmp/session-history-{フェーズスキル名}-前処理.txt` が書き出される
  3. 後処理で compliance-checker に渡す際は、全Step履歴ファイルのパス一覧を渡す
  4. 履歴ファイルの削除タイミングは、最終フェーズ（final-check）でのチェック後すべてOKになったタイミング
  5. phase-compliance-check スキルの session_history_file パラメータが複数ファイル対応に変更されている
  6. 全フェーズスキル（全7WF）に適用されている
- 優先度: Must

---

### REQ-C-007: 設計系共通スキルのモード統一（mode: delta）

- 種別: 仕様変更
- 説明: 設計系共通スキル7種のうち、現在 `mode: update` を使用している3スキル（object-design / gui-design / ddd-modeling）を `mode: delta` に統一する。さらに object-design / gui-design は既存設計書を直接更新する動きを廃止し、`{changes_dir}/delta-{領域名}.md` への中間ファイル出力に変更する。これにより「差分設計フェーズ中は既存設計書を直接変更しない」という Iron Law と整合させる。
- 受入基準:
  1. `skills/object-design/SKILL.md` の `mode: update` プロセスが `mode: delta` プロセスに書き換えられている
  2. `skills/object-design/object-designer-prompt.md` の `mode: update` セクションが `mode: delta` に書き換えられている
  3. object-design の `mode: delta` では既存 `object-design-*.md` を直接変更せず、`{changes_dir}/delta-object-design.md` に before→after 形式で出力する
  4. `skills/gui-design/SKILL.md` の `Update プロセス` が `Delta プロセス` に書き換えられている
  5. `skills/gui-design/gui-designer-prompt.md` の `update モード` セクションが `delta モード` に書き換えられている
  6. gui-design の `mode: delta` では既存 `gui-design.md` を直接変更せず、`{changes_dir}/delta-gui-design.md` に before→after 形式で出力する
  7. `skills/ddd-modeling/SKILL.md` のプロセスC（mode: update）の名称が `mode: delta` にリネームされている（実態は既に `delta-design.md` 出力なので動作変更なし）
  8. `skills/ddd-modeling/ddd-modeler-prompt.md` の `mode: update` 入力仕様が `mode: delta` にリネームされている
  9. 呼び出し元（変更WF・バグ修正WF・リファクタリングWF）の差分設計フェーズが `mode: delta` で呼び出すように統一されている:
     - 新 `skills/fs-change-phase2-impl/SKILL.md` — `mode: delta` で呼び出し
     - 新 `skills/fs-bugfix-phase2-impl/SKILL.md` — `mode: delta` で呼び出し
     - `skills/fs-refactoring-phase4-design/SKILL.md` — `mode: update` 記述を `mode: delta` に変更
     - `skills/fs-refactoring-phase4-design/refactoring-designer-prompt.md` — 差分設計結果の参照を `delta-{領域名}.md` ファイルに変更
  10. プロジェクト固有ドキュメント（`.aide/specs/aide-powers/tray-app-planning/.kiro-side/system-architecture.md` 等）の「差分更新モード」表記が「差分モード」表記に統一されている
- 優先度: Must

---

## 対象外（スコープ外）

- 他のWF（企画・設計・実装・設計逆引き）のフェーズ構成変更（フェーズ数・フェーズ名・フェーズ遷移の変更）
- リファクタリングWFのフェーズ構成変更（ただし、設計系共通スキル呼び出しの mode 名のみ REQ-C-007 で更新）
- 共通スキル（progress-resume-check, design-gate 等）の内部ロジック変更（ただし phase-compliance-check の入力パラメータ型変更は REQ-C-006 でスコープ内）
- プロンプトテンプレート（*-prompt.md）の指示内容・出力形式の変更（ただし遷移先スキル名の参照文字列置換と設計系共通スキルの mode 名変更は REQ-C-004 / REQ-C-007 でスコープ内）
- エージェント定義（agents/）の判定ロジック・出力形式の変更（ただし入力パラメータ仕様の更新は REQ-C-006 でスコープ内）

※ REQ-C-006 により全7WFの全フェーズスキルに step-history-writer 呼び出しルールを追加するが、これはフェーズ「構成」変更ではなく各Step末尾への処理追加であり、フェーズ数・フェーズ名・フェーズ遷移は変わらない

---

## 前提条件

- 旧フェーズスキルの全Step内容は新スキルに漏れなく移植する（機能削減なし）
- 前処理・後処理の統合により、1フェーズあたりの compliance-check 呼び出しは1回に削減される
- 新スキルの Step 番号は通し番号とし、旧フェーズの区切りは `#` 見出しで表現する

---

## 関連する既存要件

- progress-file-format.md §7.5 / §7.6（フェーズマッピング定義）
- using-aide-powers/SKILL.md（ワークフロー選択ガイド）
- phase-compliance-check/SKILL.md（進捗管理の対象フェーズ数）
- skills/object-design/SKILL.md（差分モード仕様）
- skills/gui-design/SKILL.md（差分モード仕様）
- skills/ddd-modeling/SKILL.md（差分モード仕様）
- skills/fs-refactoring-phase4-design/SKILL.md（リファクタリングWFの差分設計呼び出し）
