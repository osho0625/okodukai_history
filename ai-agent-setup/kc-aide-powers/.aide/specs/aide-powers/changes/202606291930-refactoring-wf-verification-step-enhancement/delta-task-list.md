# 差分タスクリスト

## 変更概要
リファクタリングWF（fs-refactoring-phase5-impl）の Step 3 を、他3FS（impl/change/bugfix）と同パターンの「サブエージェント起動型 動作確認試験」に引き上げる。

## 成果物種別
非プログラム成果物（Markdownスキル定義ファイル）

## テスト方針
- 自動テストフレームワーク: なし（dev-environment.md §13「自動テスト未導入」）
- 検証方法: 手動目視確認（impact-analysis.md T-1〜T-8）
- T-9（統合動作確認）: 次回リファクタリングWF実行時に確認するためスコープ外

---

## タスク一覧

### D-001: refactoring-verification-prompt.md 新規作成

| 項目 | 内容 |
|---|---|
| タスクID | D-001 |
| 種別 | 新規追加 |
| 対象ファイル | `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` |
| 依存 | なし |
| 設計参照 | delta-design.md §2（新規追加の設計） |
| 作業内容 | delta-design.md §2 のセクション1〜9の仕様に基づき、リファクタリング用動作確認プロンプトテンプレートを新規作成する |
| 検証項目 | T-1: セクション構成（1〜9が揃っていること）、T-2: プレースホルダー7個定義、T-3: 外部振る舞い保持試験がメイン検証項目、T-4: 3種類の試験テーブル定義 |

#### サブタスク
- D-001-1: セクション1〜4（タイトル・プレースホルダー・優先順位・制約）を作成
- D-001-2: セクション5（試験内容定義: セーフティネット・外部振る舞い保持・リグレッション）を作成
- D-001-3: セクション6〜7（試験手順雛形・結果報告フォーマット）を作成
- D-001-4: セクション8（verification-report.md 出力フォーマット定義）を作成
- D-001-5: セクション9（NG時の差し戻し情報）を作成

---

### D-002: SKILL.md 変更（Step 3 / 成果物テーブル / Integration）

| 項目 | 内容 |
|---|---|
| タスクID | D-002 |
| 種別 | 既存変更 |
| 対象ファイル | `skills/fs-refactoring-phase5-impl/SKILL.md` |
| 依存 | D-001（Step 3 で refactoring-verification-prompt.md を参照するため） |
| 設計参照 | delta-design.md §3（既存変更の設計: §3.1 成果物テーブル、§3.2 Step 3、§3.3 Integration） |
| 作業内容 | 以下の3箇所を delta-design.md の before→after に従って変更する |
| 検証項目 | T-5: Step 3 の書き換え確認、T-6: 成果物テーブルの追加確認、T-7: Integration セクションの参照追加確認 |

#### サブタスク
- D-002-1: 成果物テーブルに verification-report.md 行を追加（delta-design.md §3.1 after）
- D-002-2: Step 3 を「ユーザー動作検証依頼」から「動作確認試験」に書き換え（delta-design.md §3.2 after）
- D-002-3: Integration セクションに「サブエージェントプロンプト」項目を追加（delta-design.md §3.3 after）

---

### D-003: program-structure.md 更新

| 項目 | 内容 |
|---|---|
| タスクID | D-003 |
| 種別 | 設計資料更新 |
| 対象ファイル | `.aide/specs/aide-powers/program-structure.md` |
| 依存 | D-001, D-002（実装完了後に設計資料を反映するため） |
| 設計参照 | delta-design.md §5.1（program-structure.md の更新 before→after） |
| 作業内容 | `#### fs-refactoring-phase5-impl` セクションのプロセス行・成果物行・プロンプトテンプレート行を delta-design.md §5.1 after に従って更新する |
| 検証項目 | T-8: プロセス行・成果物行・テンプレート行の更新確認 |

#### サブタスク
- D-003-1: プロセス行を「Step3: ユーザー報告」→「Step3: 動作確認試験」に変更
- D-003-2: 成果物行に `verification-report.md` を追加
- D-003-3: プロンプトテンプレート行に `refactoring-verification-prompt.md`（Step3 動作確認サブエージェント委譲）を追加

---

## 依存関係図

```
D-001 (refactoring-verification-prompt.md 新規作成)
  ↓
D-002 (SKILL.md 変更) ← D-001 に依存
  ↓
D-003 (program-structure.md 更新) ← D-001, D-002 に依存
```

## 実装順序（トポロジカルソート結果）

| 順序 | タスクID | 理由 |
|---|---|---|
| 1 | D-001 | 依存なし。他タスクの前提 |
| 2 | D-002 | D-001 完了後。SKILL.md が refactoring-verification-prompt.md を参照する |
| 3 | D-003 | D-001, D-002 完了後。実装結果を設計資料に反映する |

---

## リグレッションテスト（手動目視確認）

impact-analysis.md のテスト対象一覧に基づく。

| # | テスト項目 | 確認方法 | 対応タスク |
|---|---|---|---|
| T-1 | refactoring-verification-prompt.md の構成 | セクション1〜9が揃っていること（ファイル目視確認） | D-001 |
| T-2 | プレースホルダー定義 | 7個のパラメータが定義されていること（ファイル目視確認） | D-001 |
| T-3 | リファクタリング固有試験観点 | 外部振る舞い保持試験がメイン検証項目であること（ファイル目視確認） | D-001 |
| T-4 | verification-report.md 出力フォーマット | 3種類の試験テーブル定義（ファイル目視確認） | D-001 |
| T-5 | SKILL.md Step 3 書き換え | タイトル・処理フロー・完了条件・状態判定が差分設計通り（before/after 差分確認） | D-002 |
| T-6 | SKILL.md 成果物テーブル | verification-report.md が追加されていること（ファイル目視確認） | D-002 |
| T-7 | SKILL.md Integration セクション | refactoring-verification-prompt.md への参照追加（ファイル目視確認） | D-002 |
| T-8 | program-structure.md 更新 | プロセス行・成果物行・テンプレート行の更新（before/after 差分確認） | D-003 |

### スコープ外テスト
| # | テスト項目 | 理由 |
|---|---|---|
| T-9 | 実動作確認（統合） | 次回リファクタリングWF実行時に手動確認。本タスクリストのスコープ外 |
