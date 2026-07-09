# 影響範囲分析（Phase 2 — 差分設計反映版）

## 変更種別
変更

## 1. アクター視点の影響

> 注: 本リポジトリには `user-requirements.md` / `system-requirements.md` が存在しない（dev-environment.md §14.1 参照）。アクター視点は `docs/01-about.md`、change-requirements.md の背景、および dev-environment.md から推定する。

### 影響を受けるユースケース

| ID | ユースケース | 影響概要 |
|---|---|---|
| UC-001 | フェーズスキルの前処理実行 | 署名検証が削除され「進捗確認」に置換。フェーズブロック（署名不一致による停止）が消滅 |
| UC-002 | フェーズスキルの後処理実行 | レポート記載項目検証・署名生成が削除され「進捗更新」に簡素化。`required_items`/`report_file_path` パラメータ廃止 |
| UC-003 | 最終フェーズの全フェーズ検証 | 全署名検証が削除され、進捗ファイルベースの完了確認のみに変更 |
| UC-004 | フェーズ遵守チェックの実施 | `phase-compliance-check` スキル自体が削除。機能は `phase-report-check`（簡素化後）に統合 |
| UC-005 | セッション引き継ぎ | 実行証跡テンプレート内の `phase-compliance-check` 参照が `phase-report-check` に変更。署名コマンド記述が除去 |

### 影響を受けるアクター

| アクター | 影響 |
|---|---|
| AI Agent（オーケストレータ） | 前処理・後処理の手順が軽量化。署名関連の失敗でブロックされなくなる。`required_items`/`report_file_path` の収集が不要に |
| AI Agent（サブエージェント: compliance-checker） | 削除される |
| AI Agent（サブエージェント: phase-report-checker → progress-updater） | 名称変更＋署名生成・検証・レポート記載項目検証が除去。進捗更新のみの軽量エージェントに変更 |
| AI Agent（サブエージェント: progress-final-checker） | 全署名検証ロジック除去。進捗ステータス完了確認のみに変更 |

### 説明対象アクター

| アクター | 説明が必要な内容 | 理由 |
|---|---|---|
| aide-powers 利用者（AI Agent 運用者） | setup.bat/setup.sh による再デプロイが必要 | 後方互換性なし。署名メカニズム廃止のため旧版と混在不可 |

> 操作フローが変わるアクター: AI Agent の各ロール。ただし AI Agent への「説明」は設計変更で自動的に反映されるため、人間に対する説明は再デプロイ案内のみ。

---

## 2. プログラム構成視点の影響

> 注: 本リポジトリには `program-structure.md` が存在しない（dev-environment.md §14.1 参照）。実ファイル構成と grep 解析から特定。

### 2.1 直接変更対象ファイル

| # | ファイル | 変更種別 | 変更概要 |
|---|---|---|---|
| 1 | `skills/phase-compliance-check/SKILL.md` | 削除 | ディレクトリごと完全削除 |
| 2 | `agents/compliance-checker.md` | 削除 | エージェント定義の完全削除 |
| 3 | `agents/kiro/compliance-checker.md` | 削除 | Kiro版エージェント定義の完全削除 |
| 4 | `.aide/scripts/create-sig.sh` | 削除 | 署名生成スクリプトの削除 |
| 5 | `skills/phase-report-check/SKILL.md` | 変更 | 署名検証・レポート記載項目検証の除去。進捗確認・進捗更新のみに簡素化 |
| 6 | `agents/phase-report-checker.md` | 削除→新規 | 削除し `agents/progress-updater.md` を新規作成 |
| 7 | `agents/kiro/phase-report-checker.md` | 削除→新規 | 削除し `agents/kiro/progress-updater.md` を新規作成 |
| 8 | `agents/progress-final-checker.md` | 変更 | 全署名検証ロジック除去。進捗完了確認のみに変更 |
| 9 | `agents/kiro/progress-final-checker.md` | 変更 | 同上（Kiro版） |
| 10 | `skills/using-aide-powers/references/phase-skill-rules.md` | 変更 | 署名関連記述の除去（前処理・後処理の記述更新、中止モード記述更新） |
| 11 | `.kiro/steering/aide-powers-phase-skill-rules.md` | 変更 | 上記と同一変更（配布同期ファイル） |
| 12 | `skills/session-handover/SKILL.md` | 変更 | phase-compliance-check 参照を phase-report-check に変更。署名コマンド記述除去 |
| 13 | `skills/using-aide-powers/references/progress-file-format.md` | 変更 | 署名関連記述（PHASE-SIG、省略なし宣言等）の除去 |
| 14 | `skills/step-history-writer/SKILL.md` | 変更 | progress-final-checker 説明文の更新（「検証に使用する」→「参照可能」） |

### 2.2 フェーズスキル群（一括パターン変更対象）

全41ファイルに対してテンプレート的な一括変更を適用する。

| # | ファイル | 適用パターン |
|---|---|---|
| 15 | `skills/fs-reverse-phase1-program/SKILL.md` | A（前処理）+ B（後処理） |
| 16 | `skills/fs-reverse-phase2-dev-env/SKILL.md` | A + B |
| 17 | `skills/fs-reverse-phase3-system-req/SKILL.md` | A + B |
| 18 | `skills/fs-reverse-phase4-user-req/SKILL.md` | A + B |
| 19 | `skills/fs-reverse-phase5-optional-phases/SKILL.md` | A + B |
| 20 | `skills/fs-reverse-phase6-final-check/SKILL.md` | A + C + D + E |
| 21 | `skills/fs-refactoring-phase1-status/SKILL.md` | A + B |
| 22 | `skills/fs-refactoring-phase2-candidates/SKILL.md` | A + B |
| 23 | `skills/fs-refactoring-phase3-plan/SKILL.md` | A + B |
| 24 | `skills/fs-refactoring-phase4-design/SKILL.md` | A + B |
| 25 | `skills/fs-refactoring-phase5-impl/SKILL.md` | A + B |
| 26 | `skills/fs-refactoring-phase6-doc/SKILL.md` | A + B |
| 27 | `skills/fs-refactoring-phase7-final-check/SKILL.md` | A + C + D + E |
| 28 | `skills/fs-planning-phase1-intake-and-init/SKILL.md` | A + B |
| 29 | `skills/fs-planning-phase2-explore/SKILL.md` | A + B |
| 30 | `skills/fs-planning-phase3-finalize/SKILL.md` | A + B |
| 31 | `skills/fs-planning-phase4-final-check/SKILL.md` | A + C + D + E |
| 32 | `skills/fs-impl-phase1-gate/SKILL.md` | A + B |
| 33 | `skills/fs-impl-phase2-preparation/SKILL.md` | A + B |
| 34 | `skills/fs-impl-phase3-gui-mockup/SKILL.md` | A + B |
| 35 | `skills/fs-impl-phase4-execution/SKILL.md` | A + B |
| 36 | `skills/fs-impl-phase5-final-check/SKILL.md` | A + C + D + E |
| 37 | `skills/fs-impl-phase6-doc-generation/SKILL.md` | A + B |
| 38 | `skills/fs-impl-phase7-final-check/SKILL.md` | A + C + D + E |
| 39 | `skills/fs-design-phase1-user-req/SKILL.md` | A + B |
| 40 | `skills/fs-design-phase2-system-req/SKILL.md` | A + B |
| 41 | `skills/fs-design-phase3-dev-plan/SKILL.md` | A + B |
| 42 | `skills/fs-design-phase4-architecture/SKILL.md` | A + B |
| 43 | `skills/fs-design-phase5-gui/SKILL.md` | A + B |
| 44 | `skills/fs-design-phase6-usecase/SKILL.md` | A + B |
| 45 | `skills/fs-design-phase7-ddd/SKILL.md` | A + B |
| 46 | `skills/fs-design-phase8-object/SKILL.md` | A + B |
| 47 | `skills/fs-design-phase9-infra/SKILL.md` | A + B |
| 48 | `skills/fs-design-phase10-program/SKILL.md` | A + B |
| 49 | `skills/fs-design-phase11-final-check/SKILL.md` | A + C + D + E |
| 50 | `skills/fs-change-phase1-analysis/SKILL.md` | A + B |
| 51 | `skills/fs-change-phase2-impl/SKILL.md` | A + B |
| 52 | `skills/fs-change-phase3-final-check/SKILL.md` | A + C + D + E |
| 53 | `skills/fs-bugfix-phase1-analysis/SKILL.md` | A + B |
| 54 | `skills/fs-bugfix-phase2-impl/SKILL.md` | A + B |
| 55 | `skills/fs-bugfix-phase3-final-check/SKILL.md` | A + C + D + E |

#### 変更パターン定義

| パターン | 変更内容 |
|---|---|
| A | 前処理: 「署名チェック結果」→「進捗確認結果」に変更。FAIL時の記述を汎用化 |
| B | 後処理: `report_file_path`/`required_items` パラメータ削除。「レポート記載項目リスト」セクション完全削除 |
| C | 最終チェック前処理: パターンAと同一 |
| D | 最終チェック本体: progress-final-checker 起動説明から「署名検証」記述を除去 |
| E | 最終チェック中止モード: 「署名検証をスキップし」の記述除去 |

---

## 3. シグネチャ変更の全件追跡テーブル

### 3.1 phase-report-check (verify) — シグネチャ変更

| 変更点 | Before | After |
|---|---|---|
| 処理内容 | 直前フェーズの署名検証 | 直前フェーズの完了状態確認 |
| サブエージェント名 | phase-report-checker | progress-updater |
| 実行フロー | V1〜V7（署名スクリプト確認、省略なし宣言確認、署名検証） | V1〜V4（フェーズ番号抽出、スキップ判定、進捗読込、ステータス確認） |

**呼び出し元（全件）:**

| # | ファイルパス | 呼び出し種別 |
|---|---|---|
| 1 | `skills/fs-reverse-phase{1-5}/SKILL.md` (5件) | 前処理で verify 呼び出し |
| 2 | `skills/fs-reverse-phase6-final-check/SKILL.md` | 前処理で verify 呼び出し |
| 3 | `skills/fs-refactoring-phase{1-6}/SKILL.md` (6件) | 前処理で verify 呼び出し |
| 4 | `skills/fs-refactoring-phase7-final-check/SKILL.md` | 前処理で verify 呼び出し |
| 5 | `skills/fs-planning-phase{1-3}/SKILL.md` (3件) | 前処理で verify 呼び出し |
| 6 | `skills/fs-planning-phase4-final-check/SKILL.md` | 前処理で verify 呼び出し |
| 7 | `skills/fs-impl-phase{1-4,6}/SKILL.md` (5件) | 前処理で verify 呼び出し |
| 8 | `skills/fs-impl-phase{5,7}-final-check/SKILL.md` (2件) | 前処理で verify 呼び出し |
| 9 | `skills/fs-design-phase{1-10}/SKILL.md` (10件) | 前処理で verify 呼び出し |
| 10 | `skills/fs-design-phase11-final-check/SKILL.md` | 前処理で verify 呼び出し |
| 11 | `skills/fs-change-phase{1-2}/SKILL.md` (2件) | 前処理で verify 呼び出し |
| 12 | `skills/fs-change-phase3-final-check/SKILL.md` | 前処理で verify 呼び出し |
| 13 | `skills/fs-bugfix-phase{1-2}/SKILL.md` (2件) | 前処理で verify 呼び出し |
| 14 | `skills/fs-bugfix-phase3-final-check/SKILL.md` | 前処理で verify 呼び出し |
| 15 | `skills/session-handover/SKILL.md` | 実行証跡テンプレート内参照 |

### 3.2 phase-report-check (write) — シグネチャ変更

| 変更点 | Before | After |
|---|---|---|
| 削除パラメータ | — | `required_items`, `report_file_path` |
| 処理内容 | レポート記載項目検証 + 署名生成 + 進捗更新 | 成果物存在確認 + 進捗更新 |
| サブエージェント名 | phase-report-checker | progress-updater |
| 実行フロー | W1〜W11（レポート検証、署名生成、署名埋込、verify再実行） | W1〜W5（フェーズ番号抽出、進捗確認、成果物確認、ステータス更新、詳細追記） |

**呼び出し元（全件）:**

| # | ファイルパス | 呼び出し種別 |
|---|---|---|
| 1 | `skills/fs-reverse-phase{1-5}/SKILL.md` (5件) | 後処理で write 呼び出し |
| 2 | `skills/fs-refactoring-phase{1-6}/SKILL.md` (6件) | 後処理で write 呼び出し |
| 3 | `skills/fs-planning-phase{1-3}/SKILL.md` (3件) | 後処理で write 呼び出し |
| 4 | `skills/fs-impl-phase{1-4,6}/SKILL.md` (5件) | 後処理で write 呼び出し |
| 5 | `skills/fs-design-phase{1-10}/SKILL.md` (10件) | 後処理で write 呼び出し |
| 6 | `skills/fs-change-phase{1-2}/SKILL.md` (2件) | 後処理で write 呼び出し |
| 7 | `skills/fs-bugfix-phase{1-2}/SKILL.md` (2件) | 後処理で write 呼び出し |
| 8 | `skills/session-handover/SKILL.md` | 実行証跡テンプレート内参照 |
| 9 | `skills/using-aide-powers/references/progress-file-format.md` | 説明文参照 |

### 3.3 phase-report-check (fix_open / fix_close) — シグネチャ変更なし

サブエージェント名のみ変更（phase-report-checker → progress-updater）。パラメータ・処理内容は維持。

**呼び出し元:**

| # | ファイルパス | 呼び出し種別 |
|---|---|---|
| 1 | 各 final-check スキル (8件) | FAIL時の修正起票 (fix_open) / 修正クローズ (fix_close) |

### 3.4 progress-updater（旧 phase-report-checker）— 名称変更

| 変更点 | Before | After |
|---|---|---|
| エージェント名 | phase-report-checker | progress-updater |
| ファイル名 | `agents/phase-report-checker.md` | `agents/progress-updater.md` |
| Kiro版ファイル名 | `agents/kiro/phase-report-checker.md` | `agents/kiro/progress-updater.md` |

**参照元（名称変更の影響を受ける全件）:**

| # | ファイルパス | 参照内容 |
|---|---|---|
| 1 | `skills/phase-report-check/SKILL.md` | サブエージェント呼び出し（verify/write/fix_open/fix_close） |
| 2 | 全フェーズスキル (41件) | 「レポート記載項目リスト」セクションで `phase-report-checker` を参照 → セクション自体が削除される |

### 3.5 progress-final-checker — 処理内容変更

| 変更点 | Before | After |
|---|---|---|
| 検証手順B | 署名項目存在確認 + 署名再計算照合 + ステータス完了確認 | ステータス完了確認のみ |
| description | 「全前フェーズの署名を検証し…」 | 「全前フェーズの完了状態を確認し…」 |

**呼び出し元（全件）:**

| # | ファイルパス | 呼び出し種別 |
|---|---|---|
| 1 | `skills/fs-reverse-phase6-final-check/SKILL.md` | Step1 で起動 |
| 2 | `skills/fs-refactoring-phase7-final-check/SKILL.md` | Step1 で起動 |
| 3 | `skills/fs-impl-phase5-final-check/SKILL.md` | Step1 で起動 |
| 4 | `skills/fs-impl-phase7-final-check/SKILL.md` | Step1 で起動 |
| 5 | `skills/fs-planning-phase4-final-check/SKILL.md` | Step1 で起動 |
| 6 | `skills/fs-design-phase11-final-check/SKILL.md` | Step1 で起動 |
| 7 | `skills/fs-change-phase3-final-check/SKILL.md` | Step1 で起動 |
| 8 | `skills/fs-bugfix-phase3-final-check/SKILL.md` | Step1 で起動 |
| 9 | `skills/step-history-writer/SKILL.md` | Used by セクションで参照 |

### 3.6 phase-compliance-check / compliance-checker — 完全削除

**削除対象の参照元（参照除去が必要な全件）:**

| # | ファイルパス | 参照内容 | 現行ステータス |
|---|---|---|---|
| 1 | `skills/phase-report-check/SKILL.md` | 「phase-compliance-check の派生」記述 | delta-design で除去予定 |
| 2 | `skills/session-handover/SKILL.md` | 実行証跡テンプレート内参照 | delta-design で更新予定 |
| 3 | `skills/using-aide-powers/references/phase-skill-rules.md` | 「compliance-check の verify/write」言及 | delta-design で更新予定 |
| 4 | `.kiro/steering/aide-powers-phase-skill-rules.md` | 上記と同一（配布同期） | delta-design で更新予定 |
| 5 | `agents/phase-report-checker.md` | 「compliance-checker の派生」記述 | エージェント自体が削除→新規作成 |
| 6 | `agents/kiro/phase-report-checker.md` | 同上（Kiro版） | 同上 |
| 7 | `agents/progress-final-checker.md` | 「compliance-checker が担う領域」記述 | delta-design で除去予定 |
| 8 | `agents/kiro/progress-final-checker.md` | 同上（Kiro版） | delta-design で除去予定 |
| 9 | `skills/fs-reverse-phase{1-5}/SKILL-old.md` (5件) | 旧版内の前処理/後処理参照 | 旧版（-old）のためスコープ外 |
| 10 | `skills/fs-reverse-phase6-final-check/SKILL-old.md` | 旧版内の参照 | 旧版（-old）のためスコープ外 |
| 11 | `skills/fs-refactoring-phase4-design/SKILL-old.md` | 旧版内の参照 | 旧版（-old）のためスコープ外 |
| 12 | `skills/fs-refactoring-phase7-final-check/SKILL-old.md` | 旧版内の参照 | 旧版（-old）のためスコープ外 |

> **旧版（`-old` 接尾辞）について:** これらは過去バージョンのスキル定義であり、本変更のスコープ外。現行のフェーズスキルは全て `phase-report-check` 経由であり、`phase-compliance-check` を直接呼んでいる現行スキルは存在しない（Phase 1 の分析どおり）。

---

## 4. 既存要件・システム要件との矛盾確認

### 4.1 user-requirements.md との矛盾

- **該当なし**: 本リポジトリには `user-requirements.md` が存在しない（dev-environment.md §14.1 確定済み）
- 代替確認: change-requirements.md の前提条件「署名検証がなくてもフェーズの省略を検知・防止できる代替機構（aide agent による制御）が機能していること」が成立している前提で矛盾なし

### 4.2 system-requirements.md との矛盾

- **該当なし**: 本リポジトリには `system-requirements.md` が存在しない（dev-environment.md §14.1 確定済み）

### 4.3 dev-environment.md との矛盾

- **矛盾なし**: 本変更はスキル定義・エージェント定義の変更であり、§1〜§15のいずれのルールとも矛盾しない

### 4.4 phase-skill-rules.md との矛盾

- **矛盾なし**: delta-design で phase-skill-rules.md 内の署名関連記述を明示的に更新する設計になっている。更新後のルール文面と変更内容は整合する

---

## 5. テスト対象機能の特定

### 5.1 新規テスト対象（直接変更する機能）

| # | テスト対象 | テスト観点 | 優先度 |
|---|---|---|---|
| T1 | phase-report-check (verify) 簡素化後 | 進捗確認が正しく動作するか（前フェーズ ✅完了 → PASS、未完了 → FAIL） | 必須 |
| T2 | phase-report-check (write) 簡素化後 | `required_items`/`report_file_path` なしで成果物確認＋進捗更新が動作するか | 必須 |
| T3 | progress-updater エージェント | verify/write/fix_open/fix_close の全モードが正しく動作するか | 必須 |
| T4 | progress-final-checker 簡素化後 | 署名検証なしで全フェーズ完了確認が動作するか | 必須 |
| T5 | phase-compliance-check 削除確認 | 削除後に参照エラーが発生しないこと | 必須 |
| T6 | compliance-checker 削除確認 | 削除後に参照エラーが発生しないこと | 必須 |

### 5.2 リグレッションテスト対象（影響を受ける可能性がある機能）

| # | テスト対象 | テスト観点 | 優先度 |
|---|---|---|---|
| R1 | 各フェーズスキルの前処理フロー | 「進捗確認結果」で正しく分岐するか（PASS→次工程、FAIL→ユーザー通知） | 必須 |
| R2 | 各フェーズスキルの後処理フロー | パラメータ削減後の write 呼び出しが正しく動作するか | 必須 |
| R3 | 最終チェックフェーズの正常完了 | progress-final-checker が全フェーズ完了確認後に自フェーズを ✅ 完了に更新するか | 必須 |
| R4 | 最終チェックフェーズの中止モード | 「署名検証をスキップし」除去後も中止フローが正常に動作するか | 中 |
| R5 | session-handover の実行証跡 | テンプレート更新後も引き継ぎが正しく機能するか | 中 |
| R6 | fix_open / fix_close フロー | サブエージェント名変更後も修正起票・クローズが正常に動作するか | 中 |
| R7 | step-history-writer | 説明文変更のみで機能に影響なしの確認 | 低 |
| R8 | progress-file-format | 署名関連記述除去後、進捗ファイルの読み書きに影響なしの確認 | 低 |

---

## 6. 後方互換性

- **後方互換性なし**: 署名メカニズムの完全廃止により、旧バージョンのスキル定義との互換性は保たない
- **必要なアクション**: setup.bat / setup.sh によるグローバル領域への再デプロイが必要
- **既存進捗ファイル**: 署名行（`<!-- PHASE-SIG:... -->`）・省略なし宣言行が残存する既存進捗ファイルは、新版では無視される（エラーにはならない）

---

## 7. 旧版（-old 接尾辞）ファイルの扱い

Phase 1 で特定した `SKILL-old.md` ファイル群（6件: fs-reverse-phase{1-6}, fs-refactoring-phase{4,7}）は全て旧版のアーカイブであり、本変更のスコープ外。更新しない。

---

## 8. 変更ファイル総数サマリ

| カテゴリ | ファイル数 |
|---|---|
| 完全削除 | 4件（phase-compliance-check/SKILL.md, compliance-checker.md ×2, create-sig.sh） |
| 削除→新規作成（名称変更） | 4件（phase-report-checker.md ×2 → progress-updater.md ×2） |
| 変更（コア） | 6件（phase-report-check, progress-final-checker ×2, phase-skill-rules ×2, session-handover） |
| 変更（参照更新） | 2件（progress-file-format, step-history-writer） |
| 変更（フェーズスキル一括パターン） | 41件 |
| **合計** | **57件** |

---

## 9. 起因元ドキュメントフォルダ

- パス: なし
- コミットハッシュ: なし
- コミットメッセージ1行目: なし
- 検証結果: Docs: フッターなし（新規変更要求のため起因元なし）

---

## 10. Phase 1 → Phase 2 差分

| 項目 | Phase 1 | Phase 2（本版） |
|---|---|---|
| `agents/kiro/compliance-checker.md` | 未記載 | 追加（削除対象として特定） |
| `agents/kiro/phase-report-checker.md` | 未記載 | 追加（名称変更対象として特定） |
| `agents/kiro/progress-final-checker.md` | 未記載 | 追加（簡素化対象として特定） |
| `.aide/scripts/create-sig.sh` | 未記載 | 追加（削除対象として特定） |
| シグネチャ変更全件追跡テーブル | なし | 追加（Iron Law 準拠） |
| テスト対象機能テーブル | なし | 追加 |
| 説明対象アクターテーブル | なし | 追加 |
| 変更パターン定義 | なし | 追加（A〜E の5パターン） |
| フェーズスキル対象ファイル一覧 | 概要のみ | 41件全件列挙 |
| 既存要件矛盾確認 | なし | 追加（矛盾なし確認済み） |
| 後方互換性 | なし | 追加 |
