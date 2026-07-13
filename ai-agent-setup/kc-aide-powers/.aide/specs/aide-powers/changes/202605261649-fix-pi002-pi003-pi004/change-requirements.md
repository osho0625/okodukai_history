# 変更要求定義書

## 変更概要

### 目的・背景

aide-powers の複数ワークフローにおいて、以下の3つの問題が発見された:
1. タスク計画スキルのレベル構成記述が古い（PI-002）
2. 実装フェーズに非プログラム成果物の簡略サイクル記述がない（PI-003）
3. 全WFの差分設計/タスク計画フェーズで工程チェック表生成が漏れる（PI-004）

これらは全て aide-powers のスキルファイル（Markdown）のテキスト修正であり、1つの変更WFで一括対応する。

### 変更種別

仕様変更（modification）+ 機能追加（addition）の複合（combined）

---

## 要求事項

### REQ-C-001: タスク計画スキルのレベル構成記述を依存関係ベースに更新

- **種別:** 仕様変更（modification）
- **説明:** fs-change-phase7-task-planning スキルの delta-task-list.md ドキュメント構成に「レベル別タスク一覧」が記載されているが、共通スキル impl-task-planning では「レベルの概念は使用しない。依存先が全て完了したタスクは即座に起動可能」と明記されている。変更WF・バグ修正WF・リファクタリングWFのタスク計画フェーズスキルを、impl-task-planning の方式（依存関係ベース・フラット構成・レベル概念廃止）に合わせて更新する。
- **対象ワークフローと修正対象ファイル:**
  | ワークフロー | フェーズ | 修正対象ファイル |
  |---|---|---|
  | 変更WF | Phase 7（タスク計画） | `skills/fs-change-phase7-task-planning/SKILL.md` |
  | 変更WF（旧番号体系） | Phase 6（タスク計画） | `skills/fs-change-phase6-task-planning/SKILL.md` |
  | バグ修正WF | Phase 4（修正設計） | `skills/fs-bugfix-phase4-design/SKILL.md` |
  | リファクタリングWF | Phase 4（差分設計） | `skills/fs-refactoring-phase4-design/SKILL.md` |
- **受入基準:**
  - fs-change-phase7-task-planning の delta-task-list.md ドキュメント構成からレベル概念が削除されている
  - fs-change-phase6-task-planning も同様に更新されている
  - fs-bugfix-phase4-design のタスク分解セクションからレベル概念が削除されている
  - fs-refactoring-phase4-design のタスク分解セクションからレベル概念が削除されている
  - impl-task-planning の方式（依存関係ベース・フラット構成）と整合している
- **優先度:** 中

### REQ-C-002: 実装フェーズスキルに非プログラム成果物の簡略サイクルを追加

- **種別:** 機能追加（addition）
- **説明:** 実装WF（fs-impl-phase4-execution）には「成果物種別の判定」セクションと「非プログラム成果物の簡略サイクル」が明記されているが、変更WF（fs-change-phase8-impl）・バグ修正WF（fs-bugfix-phase5-impl）・リファクタリングWF（fs-refactoring-phase5-impl）の実装フェーズスキルには同等の記述がない。これらのスキルに判定手順と簡略サイクルの記述を追加する。
- **対象ワークフローと修正対象ファイル:**
  | ワークフロー | フェーズ | 修正対象ファイル |
  |---|---|---|
  | 変更WF | Phase 8（差分実装） | `skills/fs-change-phase8-impl/SKILL.md` |
  | 変更WF（旧番号体系） | Phase 7（差分実装） | `skills/fs-change-phase7-impl/SKILL.md` |
  | バグ修正WF | Phase 5（修正実装） | `skills/fs-bugfix-phase5-impl/SKILL.md` |
  | リファクタリングWF | Phase 5（実装） | `skills/fs-refactoring-phase5-impl/SKILL.md` |
  | （参照元） | Phase 4（実装実行） | `skills/fs-impl-phase4-execution/SKILL.md` |
- **受入基準:**
  - fs-change-phase8-impl に「成果物種別の判定」セクションと「非プログラム成果物の簡略サイクル」セクションが追加されている
  - fs-change-phase7-impl にも同等のセクションが追加されている
  - fs-bugfix-phase5-impl に同等のセクションが追加されている
  - fs-refactoring-phase5-impl に同等のセクションが追加されている
  - fs-impl-phase4-execution の記述と整合している
- **優先度:** 中

### REQ-C-003: タスク計画フェーズに工程チェック表生成手順を追加

- **種別:** 機能追加（addition）
- **説明:** impl-task-planning 共通スキルを呼び出してタスク分解を行う全てのフェーズで、工程チェック表（impl-process-checklist.md）の生成が含まれていない。実装フェーズの Iron Law で「工程チェック表なしでの実装開始を絶対禁止」としているにもかかわらず、前フェーズで生成する手順が明記されていないため、毎回実装フェーズ開始時に HARD-GATE で引っかかる。
- **対象ワークフローと修正対象ファイル:**
  | ワークフロー | フェーズ | 修正対象ファイル |
  |---|---|---|
  | 共通スキル | — | `skills/impl-task-planning/SKILL.md` |
  | バグ修正WF | Phase 4（修正設計） | `skills/fs-bugfix-phase4-design/SKILL.md` |
  | 変更WF | Phase 5（差分設計） | `skills/fs-change-phase5-delta-design/SKILL.md` |
  | 変更WF | Phase 7（タスク計画） | `skills/fs-change-phase7-task-planning/SKILL.md` |
  | 変更WF（旧番号体系） | Phase 4（差分設計） | `skills/fs-change-phase4-delta-design/SKILL.md` |
  | 変更WF（旧番号体系） | Phase 6（タスク計画） | `skills/fs-change-phase6-task-planning/SKILL.md` |
  | リファクタリングWF | Phase 4（差分設計） | `skills/fs-refactoring-phase4-design/SKILL.md` |
  | 実装WF | Phase 2（実装準備） | `skills/fs-impl-phase2-preparation/SKILL.md` |
- **受入基準:**
  - impl-task-planning 共通スキルの出力成果物に impl-process-checklist.md が追加されている
  - impl-task-planning スキル内に工程チェック表のテンプレートが定義されている
  - 上記全フェーズスキルのタスク分解ステップに「impl-process-checklist.md の生成」が明記されている
- **優先度:** 高

### REQ-C-004: バグ修正WFのドキュメント反映フェーズで history.md を常に必須成果物にする

- **種別:** 仕様変更（modification）
- **説明:** fs-bugfix-phase6-doc スキルの成果物テーブルで history.md が「フォルダ統合済みの場合のみ」と条件付きになっているが、history.md はフォルダ統合の有無に関わらず常に必要。変更WFは既に常に必須なので変更不要。リファクタリングWFは不要のまま維持。
- **対象ワークフローと修正対象ファイル:**
  | ワークフロー | フェーズ | 修正対象ファイル |
  |---|---|---|
  | バグ修正WF | Phase 6（ドキュメント更新） | `skills/fs-bugfix-phase6-doc/SKILL.md` |
- **受入基準:**
  - fs-bugfix-phase6-doc の成果物テーブルから「フォルダ統合済みの場合のみ」の条件が削除されている
  - Step 1 の doc-sync への history.md 指示から条件分岐が削除され、常に作成・追記する記述になっている
  - 完了条件テーブルの「フォルダ統合済みの場合」条件が削除されている
  - 変更WF（fs-change-phase9-completion 等）は変更不要であることが確認されている
  - リファクタリングWFは history.md 不要のまま維持されている
- **優先度:** 中

---

## 対象外（スコープ外）

- 実装WF（fs-impl-phase4-execution）の既存記述の変更（既に正しい記述がある）
- multi-stage-code-review スキルの変更（既に非プログラム成果物の定義がある）
- 新しいワークフローの追加
- テストフレームワークの導入

## 前提条件

- aide-powers プロジェクトの設計書ゲートはユーザー許可により免除されている
- 修正対象は全てスキルファイル（Markdown）のテキスト修正のみ
- PI-001 は別途バグ修正WFで対応済み（commit 88e12df）

## 関連する既存要件

- impl-task-planning 共通スキル: 依存関係ベース・フラット構成・レベル概念廃止の方式を定義済み
- fs-impl-phase4-execution: 「成果物種別の判定」「非プログラム成果物の簡略サイクル」を定義済み
- multi-stage-code-review: 非プログラム成果物の判定基準を定義済み
