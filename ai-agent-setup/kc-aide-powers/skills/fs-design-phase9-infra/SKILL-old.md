---
name: fs-design-phase9-infra
description: "Use when Phase 8 (object design) is complete and approved, to design infrastructure interface specifications including API definitions, data store schemas, external service integrations, and repository concrete implementations."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# インフラ/インターフェース設計（fs-design-phase9-infra）

## Overview

**Core principle:** オブジェクト設計で定義されたドメインモデルとレイヤードアーキテクチャに基づき、外部との境界（API、データストア、外部サービス連携）のインターフェース仕様を具体化する。ドメインオブジェクトと永続化スキーマの分離を維持し、各インターフェースの仕様を実装可能なレベルまで詳細化する。

fs-design-phase9-infra は設計ワークフローのフェーズ9として、オブジェクト設計（フェーズ8）完了後に実行される。API定義、データストアスキーマ定義、外部サービス連携定義、リポジトリインターフェースの具象実装方針を設計し、`infra-interface-design.md` として成果物を作成する。

## The Iron Law

```
NO INTERFACE SPECIFICATION SHALL BE DEFINED WITHOUT BASIS IN OBJECT DESIGN.
オブジェクト設計（object-design-*.md）で定義されたインターフェースに基づかずに、独自のインターフェース仕様を定義してはならない。
```

インフラIF設計はオブジェクト設計の「具象化」であり、新たなインターフェースの追加や既存インターフェースの変更はフェーズ8の範囲である。矛盾がある場合はユーザーに報告し、object-design-*.md の修正を提案する。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| infra-interface-design.md | `.aide/specs/{feature_name}/infra-interface-design.md` | インフラ/インターフェース設計書（API定義、データストアスキーマ、外部サービス連携、リポジトリ具象実装方針） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-design-phase9-infra
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `.aide/specs/{feature_name}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

**前提:** fs-design-phase8-object (aide-powers skill) 完了（ゲート3通過後）

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase9-infra`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `.aide/specs/{feature_name}`

### Step 1: サブエージェント派遣（phase9 モード）
- `./infra-interface-designer-prompt.md` を Read で読み込み、テンプレート変数を埋めて Task でサブエージェントをディスパッチする
- サブエージェントに渡す情報:
  - feature_name
  - mode: phase9
  - 前フェーズ成果物のパス
- サブエージェントの処理:
  1. infra-interface-design (aide-powers skill)（新規作成モード: create）を読み込む
  2. 前フェーズ成果物の読み込みと設計対象の特定
     - user-requirements.md: Must要件から外部IF要件を把握
     - system-requirements.md: 技術スタック、データ管理方式、外部サービス依存を把握
     - system-architecture.md: アーキテクチャ図から外部IF・データストア・外部サービスの接続先を把握
     - gui-design.md: UIイベントとアプリケーション層の連携ポイントを把握
     - layered-architecture.md: DDD採用/不採用の確認、レイヤー間依存ルールの把握
     - object-design-domain.md: ドメインオブジェクト構造、リポジトリインターフェース定義を把握
     - object-design-infrastructure.md: インフラ層クラス構成、リポジトリ具象実装概要を把握
     - 設計対象の一覧を作成し、ユーザーに確認する
  3. layered-architecture.md からDDD採用/不採用を確認し、設計方針を決定
     - DDD採用時: ドメインオブジェクトと永続化スキーマを分離、DTOを使用
     - DDD不採用時: サービス層のデータ構造をそのまま使用可
  4. API定義の設計（該当する場合）
     - REST API: エンドポイント一覧、スキーマ、ステータスコード、認証方式
     - CLI: コマンド一覧、入出力フォーマット、終了コード
     - GUI: UIイベント対応表、コールバック定義
  5. データストアスキーマの設計（該当する場合）
     - RDB: テーブル定義、ER図、マイグレーション方針
     - ファイルベース: ファイル形式、スキーマ、排他制御方針
     - KVS/NoSQL: キー設計、アクセスパターン
  6. 外部サービス連携の設計（該当する場合）
     - 外部API仕様、ラッパーIF、リトライ・タイムアウト方針
  7. リポジトリインターフェースの具象実装方針の定義
     - 具象クラスの実装方針
     - データマッピング（ドメインオブジェクト ↔ 永続化形式）
     - クエリ/フィルタリングの実装方針
  8. infra-interface-design.md の作成
  9. ユーザーへの提示と合意取得
- 分岐:
  - ユーザー合意 → Step後処理を実行し、Step 2へ
  - ユーザーが修正を要求 → サブエージェントがユーザーと対話して修正 → 再提示

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase9-infra`, step_id: `step1`, step_title: `サブエージェント派遣（phase9 モード）`, artifact_dir: `.aide/specs/{feature_name}`

### Step 2: サブエージェント報告の評価
- DONE: Step後処理を実行し、Step 3へ
- DONE_WITH_CONCERNS: 懸念事項を確認し、必要に応じて対処後Step 3へ
- NEEDS_CONTEXT: 不足情報を補完してStep 1を再実行
- BLOCKED: 段階的対応（コンテキスト追加 → タスク分割 → ユーザーエスカレーション）

> **Step後処理:** step-history-writer (aide-powers skill) を activate して実行。パラメータ — skill_name: `fs-design-phase9-infra`, step_id: `step2`, step_title: `サブエージェント報告の評価`, artifact_dir: `.aide/specs/{feature_name}`

### Step 3: 成果物の確認
- infra-interface-design.md が作成されていることを確認
- 設計対象の一覧が含まれていることを確認
- 該当するインターフェース定義が全て含まれていることを確認

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase9-infra`, step_id: `step3`, step_title: `成果物の確認`, artifact_dir: `.aide/specs/{feature_name}`

### 後処理
1. doc-index-maintenance (aide-powers skill)（infra-interface-design.md を登録）
2. phase-compliance-check (aide-powers skill: write)
3. git-commit-workflow (aide-powers skill)
4. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-design-phase10-program (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-design-phase9-infra`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `.aide/specs/{feature_name}`

### fix モード（QA指摘修正 / ユーザー指摘修正）

**Step 1:** サブエージェント派遣（fix モード）
- `./infra-interface-designer-prompt.md` を Read で読み込み、テンプレート変数を埋めて Task でサブエージェントをディスパッチする
- サブエージェントに渡す情報:
  - feature_name
  - mode: fix
  - QA指摘内容 or ユーザー指摘内容
  - 修正対象ファイル（infra-interface-design.md）
- サブエージェントの処理:
  1. infra-interface-design (aide-powers skill)（fix モード）を読み込む
  2. 指摘内容の分析（修正が必要な箇所を特定）
  3. infra-interface-design.md の修正
  4. object-design-*.md との整合性確認
  5. 修正範囲が他フェーズに及ぶ場合はその旨を報告
  6. ユーザーへの提示と合意取得
- 分岐:
  - ユーザー合意 → Step 2へ
  - ユーザーが修正を要求 → サブエージェントがユーザーと対話して修正 → 再提示

**Step 2:** 共通スキルの呼び出し
- **REQUIRED SUB-SKILL:** Use git-commit-workflow (aide-powers skill)

### 完了条件

以下の全てを満たすこと:

1. `infra-interface-design.md` が作成されている
2. infra-interface-design.md に以下のセクションが含まれている:
   - 設計対象の一覧（どのインターフェースが該当するか）
   - API定義（該当する場合）
   - データストアスキーマ定義（該当する場合）
   - 外部サービス連携定義（該当する場合）
   - リポジトリ具象実装方針
   - データマッピングルール
3. DDD採用時: ドメインオブジェクトと永続化スキーマが明確に分離されている
4. DDD採用時: APIのリクエスト/レスポンスにDTOが使用されている（ドメインオブジェクトを直接公開していない）
5. object-design-*.md で定義された全てのリポジトリインターフェースに対する具象実装方針が定義されている
6. ユーザーが infra-interface-design.md の内容に合意している
7. doc-index-maintenance (aide-powers skill) が完了している
8. git-commit-workflow (aide-powers skill) が完了している
9. 進捗ファイル（design-progress.md）の該当フェーズ行が `✅ 完了` に更新されている
10. 完了日時が `YYYY-MM-DD HH:MM` 形式で記録されている
11. 成果物テーブルが progress-file-format.md §3 / §5 の共通フォーマットに従って記録されている
12. ステータステーブルとフェーズ詳細サブセクションの状態・完了日時が一致している

### 厳守ルール

- **ユーザー合意なしに次フェーズへ進んではならない**
- **object-design-*.md に定義されていないインターフェースを追加してはならない**

### ビジュアルコンパニオン活用

以下の場面では `visual-companion` (aide-powers skill) を使い、ブラウザでイメージを表示してユーザーに確認すること。
文字だけの説明より図で見せた方がわかりやすい場面では、積極的に活用する。

- ER図（RDBスキーマ）・データマッピング図の表示
- API構成図・シーケンス図の視覚的提示

## Red Flags - STOP

以下の思考パターンに気づいたら、即座に停止して正しいプロセスに戻ること:

| Red Flag | なぜ危険か |
|---|---|
| 「object-design-*.md にないインターフェースを追加しよう」 | インターフェースの追加はフェーズ8の範囲。矛盾がある場合はユーザーに報告し、object-design-*.md の修正を提案する |
| 「ドメインオブジェクトをそのままAPIレスポンスに使おう」（DDD採用時） | DDD採用時はDTOを使用する。ドメインオブジェクトの直接公開はレイヤー間依存違反 |
| 「データストアのスキーマをドメインモデルと同じ構造にしよう」（DDD採用時） | ドメインモデルと永続化スキーマは分離する。データマッピングルールを定義する |
| 「リポジトリの具象実装の詳細コードを書こう」 | フェーズ9は仕様の定義であり、実装コードは書かない。実装方針とデータマッピングルールを定義する |
| 「system-requirements.md にないデータストアを使おう」 | データストアの選定はフェーズ2の範囲。矛盾がある場合はユーザーに報告する |
| 「ユーザーに確認せずに進めよう」 | 合意なしに次のフェーズに進まない |
| 「テスト用ダミー実装の方針を省略しよう」 | テスト用ダミー実装はフェーズ8で設計済みだが、具象実装方針との整合性を確認する |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「API定義は実装時に決めればよい」 | API定義は設計段階で確定する。実装時に変更するとフロントエンド/バックエンドの整合性が崩れる |
| 「ファイルベースのスキーマは単純だから定義不要」 | ファイル形式・命名規則・排他制御方針は設計段階で定義する。実装時の判断ブレを防ぐ |
| 「外部サービスの仕様は外部に依存するから設計できない」 | 外部サービスの仕様を調査し、ラッパーインターフェースとエラーハンドリング方針を定義する。外部依存だからこそ設計が重要 |
| 「リポジトリの具象実装方針はフェーズ8で定義済み」 | フェーズ8はインターフェース定義。フェーズ9は具象実装の方針（データマッピング、クエリ方針等）を定義する |
| 「DDD不採用だからデータマッピングは不要」 | DDD不採用でもサービス層のデータ構造と永続化形式の対応関係は明確にする |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**Required workflow skills:**
- `doc-index-maintenance` (aide-powers skill) — 成果物作成後のドキュメントインデックス更新
- `git-commit-workflow` (aide-powers skill) — フェーズ完了時のgitコミット
- `infra-interface-design` (aide-powers skill) — インフラIF設計の手法・ルール・品質基準（サブエージェント内で使用）
- `pending-issues-management` (aide-powers skill) — 問題発見時の記録
- `user-profile-management` (aide-powers skill) — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Called by:**
- `fs-design-phase8-object` (aide-powers skill)（REQUIRED SUB-SKILL として）

**Next phase:**
- **REQUIRED SUB-SKILL:** `fs-design-phase10-program` (aide-powers skill)

**Input from caller:**
- feature_name（プロジェクト名）
- specs_dir（`.aide/specs/{feature_name}`）

**Global rules:** `.aide/references/global-rules.md` を厳守
