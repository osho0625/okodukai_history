# 差分設計書（索引） — 動作確認試験書レビューループの導入

- **feature_name:** aide-powers
- **変更ID:** 202607010000-manual-test-review-loop
- **作成日:** 2026-07-01
- **入力:** approach.md / impact-analysis.md / change-requirements.md

---

## 設計方針

1. **名前付きエージェント新設（DRY・OCP）**: 動作確認試験書レビューアー `manual-test-review-agent` を4系統で新設し、WF別基準は `wf_type` 引数で切り替える。レビューロジックは1箇所に集約
2. **方式(a) 1プロンプト2セクション化**: verificationプロンプトを「試験書作成」「試験実行」の2セクションに再編し、SKILL側で2回呼び分けて3工程を実現（ファイル増加なし）
3. **3工程分離（①作成→②レビュー→③実行）**: レビューPASSを試験実行への進行ゲートとする。②のループは停滞時プロセスC準拠
4. **エビデンス報告の2箇所反映**: verificationプロンプトの「結果の出力」と SKILL のユーザー報告部分の両方に実施方法・エビデンス明示を追加
5. **既存コードパターン準拠**: エージェント定義のフロントマター形式・判定文字列（APPROVED/NEEDS_FIX）・行動規範スタイルは既存12エージェントに合わせる

---

## 新規追加の設計

新規エージェント（manual-test-review-agent）の設計は以下の分割ファイルに記載:

| 分割ファイル | 内容 |
|---|---|
| [delta-design-review-agent.md](./delta-design-review-agent.md) | 新規エージェント4系統（agents/*.md, agents/kiro/*.md, agents/kiro/*.json, agents/kiro/prompts/*-prompt.md）の完全設計 |

---

## 修正対象の差分設計

既存ファイルへの変更（before→after形式）は以下の分割ファイルに記載:

| 分割ファイル | 対象 | 内容 |
|---|---|---|
| [delta-design-skill-steps.md](./delta-design-skill-steps.md) | C1〜C4: 4 SKILL.md | 動作確認Stepの3工程再構成＋レビューループ挿入＋エビデンス報告追加 |
| [delta-design-verification-prompts.md](./delta-design-verification-prompts.md) | C5〜C8: 4 verification-prompt.md | 2セクション化＋エビデンス報告追加 |
| [delta-design-program-structure.md](./delta-design-program-structure.md) | C9: program-structure.md | エージェント数12→13の全記述更新 |

---

## インターフェース影響サマリ

本変更で追加・変更されるインターフェース:

| 変更種別 | 対象 | 影響 |
|---|---|---|
| 新規エージェント追加 | `manual-test-review-agent` | 4 SKILL.md の動作確認Stepから呼び出す。既存コードへの破壊的影響なし |
| SKILL Step内構造変更 | 4 SKILL.md の動作確認Step | 内部構造の再編。外部インターフェース（Step番号・Input/Output・呼び出し元）は不変 |
| verificationプロンプト再編 | 4 verification-prompt.md | 2セクション構成に変更。SKILL側が「作成モード」「実行モード」で2回起動する方式に変更。呼び出し元SKILL以外からの参照なし |

**シグネチャ変更:** なし（新規追加のみ。既存エージェント・既存スキルの公開インターフェースに変更なし）

**呼び出し元への影響:** setup.bat / setup.sh は `agents/kiro/` 丸ごとコピー方式のため改修不要。新規ファイル配置のみで自動配布対象になる。

---

## 更新が必要な設計資料

| 設計資料 | 更新内容 | 更新タイミング |
|---|---|---|
| `.aide/specs/aide-powers/program-structure.md` | エージェント数12→13、ツリー・解説・配布表の更新（本差分設計 delta-design-program-structure.md に before→after 記載） | 本変更の実装時 |
| `docs-dev/02-ai-agent/04-agents/qa-agents.md` | 新エージェント `manual-test-review-agent` の説明追記（before→after は下記参照） | 本変更の実装時（doc-sync で対応） |

### `docs-dev/02-ai-agent/04-agents/qa-agents.md` の追記内容（before→after）

> 本ファイルは QA レビューアーエージェント（`APPROVED`/`REJECTED` 判定系）の解説専用であり、`manual-test-review-agent` は判定文字列が異なる（`APPROVED`/`NEEDS_FIX`）別カテゴリのエージェントである。既存の「QAレビューアーエージェント詳細」という位置づけを変えずに追記するため、ファイル末尾に新規セクションを追加する形とする。

**before:**（ファイル末尾。`delta-design-qa-agent` セクションの直後で終了）
```
### 行動規範

- before → after チェックは差分設計書の記述を鵜呑みにせず、既存設計書の実際の内容と必ず突き合わせる。
- 設計原則の例外・回避を検出した場合は無条件で FAIL とする。
- 各設計領域の専門的な正しさは担当外（`requirements-qa-agent` 等が並行して判定する）。
```
（ファイル終端）

**after:**（末尾に以下セクションを追記）
```
### 行動規範

- before → after チェックは差分設計書の記述を鵜呑みにせず、既存設計書の実際の内容と必ず突き合わせる。
- 設計原則の例外・回避を検出した場合は無条件で FAIL とする。
- 各設計領域の専門的な正しさは担当外（`requirements-qa-agent` 等が並行して判定する）。

## manual-test-review-agent（試験書品質レビューアー、参考）

> 本エージェントは上記5エージェントとは判定文字列が異なる（`APPROVED` / `NEEDS_FIX`）ため、
> 厳密な「QAレビューアーエージェント」カテゴリの外側だが、動作確認試験書の品質を判定する
> レビューアーとして密接に関連するため本ファイルに併記する。

### 役割

動作確認試験書 品質レビューアーエージェント。4WF（実装 / バグ修正 / 変更 / リファクタリング）の
動作確認Stepで生成された試験書が「ユーザー視点で全動作を検証しているか」をレビューする。
試験書作成直後・試験実行前の品質ゲートとして機能し、PASSするまで試験実行に進めない。

### 入力

- `wf_type`（`impl` / `bugfix` / `change` / `refactoring`）
- 試験書パス（`testing/test-{機能名}-test-plan.md`）
- WF固有入力ファイル（usecase-analysis.md / bug-report.md・fix-plan.md / change-requirements.md / refactoring-plan.md）

### 主な検証観点

- 共通4観点: ユーザー操作シナリオか／ユーザー視点の網羅性（質的）／目視可能な期待結果か／内部視点混入検出
- WF別基準: `wf_type` に応じた追加基準（再現手順の未再現確認、受入基準の検証等）

### 判定

- `APPROVED`（指摘0件）/ `NEEDS_FIX`（指摘1件以上）

### test-coverage-audit-agent との責務境界

| 軸 | test-coverage-audit-agent | manual-test-review-agent |
|---|---|---|
| 主眼 | 量的網羅性（要件ID×試験項目の1対1照合） | 質的視点（ユーザー視点・操作シナリオ・目視可能な期待結果） |
| 実行タイミング | 実装WF最終チェック | 4WFの動作確認Step（試験書作成直後） |
| 対象WF | 実装WFのみ | 実装・バグ修正・変更・リファクタリングの4WF |
```

---

*本書は索引であり、詳細は各分割ファイルを参照のこと。*
