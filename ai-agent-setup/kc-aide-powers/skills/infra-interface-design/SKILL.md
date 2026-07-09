---
name: infra-interface-design
description: "Use when designing or updating infrastructure interface specifications — API definitions, data store schemas, external service integrations, and repository concrete implementations."
---

# インフラ/インターフェース設計

## Overview

**Core principle:** オブジェクト設計で定義されたドメインモデルとレイヤードアーキテクチャに基づき、外部との境界（API、データストア、外部サービス連携）のインターフェース仕様を実装可能なレベルまで具体化する。

このスキルは4つのモードで動作する:
- **create**: 新規にインフラIF設計書を作成する（設計ワークフロー）
- **delta**: 既存のインフラIF設計書に対して差分更新を行う（変更・バグ修正・リファクタリングワークフロー）
- **reverse**: 既存コードのインフラ実装を解析して設計書を逆生成する（設計逆引きワークフロー）
- **fix**: QA指摘やユーザー指摘に基づき設計書を修正する

## Process

**Skip conditions:**
- インフラ層が存在しないプロジェクト（純粋なライブラリ等）→ スキップ可能
- 設計逆引きWFで、コードにインフラ層の実装が見当たらない場合 → スキップ可能

### モード判定

呼び出し時のモードに応じて、以下のいずれかのプロセスを実行する。

### create モード（新規作成）

**Step 1:** infra-interface-designer-prompt.md に基づきサブエージェントを起動
- Task でサブエージェントをディスパッチする。サブエージェントが以下を実行:
  1. 前フェーズ成果物の読み込みと設計対象の特定
     - system-architecture.md からアーキテクチャ図を読み、外部IF・データストア・外部サービスを把握
     - object-design-infrastructure.md からリポジトリインターフェースの具象実装対象を把握
     - layered-architecture.md からDDD採用/不採用を確認
     - 設計対象の一覧を作成し、ユーザーに確認する
  2. DDD採用/不採用に応じた設計方針の決定
     - DDD採用時: ドメインオブジェクトと永続化スキーマを分離、DTOを使用
     - DDD不採用時: サービス層のデータ構造をそのまま使用可
  3. API定義の設計（該当する場合）
     - REST API: エンドポイント一覧、スキーマ、ステータスコード、認証方式
     - CLI: コマンド一覧、入出力フォーマット、終了コード
     - GUI: UIイベント対応表、コールバック定義
  4. データストアスキーマの設計（該当する場合）
     - RDB: テーブル定義、ER図、マイグレーション方針
     - ファイルベース: ファイル形式、スキーマ、排他制御方針
     - KVS/NoSQL: キー設計、アクセスパターン
  5. 外部サービス連携の設計（該当する場合）
     - 外部API仕様、ラッパーIF、リトライ・タイムアウト方針
  6. リポジトリインターフェースの具象実装方針の定義
     - 具象クラスの実装方針
     - データマッピング（ドメインオブジェクト ↔ 永続化形式）
     - クエリ/フィルタリングの実装方針
  7. infra-interface-design.md の作成
  8. ユーザーへの提示と合意取得

**Step 2:** ユーザー合意の確認
- 合意あり → 完了
- 合意なし → サブエージェントに修正を指示し、Step 1に戻る

### delta モード（差分更新）

**Step 1:** 既存の infra-interface-design.md を Read で読み込む

**Step 2:** 変更要求/修正方針と影響分析結果を Read で読み込む

**Step 3:** infra-interface-designer-prompt.md に基づきサブエージェントを起動（delta モード）
- サブエージェントが以下を実行:
  1. 影響範囲のインターフェース仕様を特定
  2. 変更内容を before → after 形式で設計
  3. 差分設計書（delta-design.md / fix-design.md / refactoring-design.md）に記載
  4. object-design-*.md との整合性を確認
  5. 他のインターフェース定義との整合性を確認
  6. ユーザーへの提示と合意取得

**Step 4:** ユーザー合意の確認
- 合意あり → 完了
- 合意なし → サブエージェントに修正を指示し、Step 3に戻る

### reverse モード（逆引き）

**Step 1:** infra-interface-designer-prompt.md に基づきサブエージェントを起動（reverse モード）
- サブエージェントが以下を実行:
  1. インフラ層の特定
     - program-structure.md からインフラ層のファイル一覧を把握
     - object-design-*.md が存在する場合はリポジトリインターフェース定義を参照
  2. データ永続化の解析
     - DB接続（SQLAlchemy, sqlite3等）の実装を解析
     - ファイルI/O（JSON, CSV, YAML等）の実装を解析
     - テーブル定義/ファイルスキーマを抽出
  3. 外部サービス連携の解析
     - 外部API呼び出しの実装を解析
     - 外部ライブラリのラッパー実装を解析
     - リトライ・タイムアウト設定を抽出
  4. リポジトリパターンの解析
     - リポジトリクラスの実装を解析
     - データマッピングの実装を抽出
     - クエリ/フィルタリングの実装を抽出
  5. API/CLI/GUIインターフェースの解析（該当する場合）
     - エンドポイント定義、コマンド定義、イベントハンドラを抽出
  6. infra-interface-design.md の逆生成
     - 解析結果を設計書フォーマットに構造化
     - 「コードの現実を記録する」原則に従い、理想化しない
  7. ユーザーへの提示と合意取得

**Step 2:** ユーザー合意の確認
- 合意あり → 完了
- 合意なし → サブエージェントに修正を指示し、Step 1に戻る

### fix モード（修正）

**Step 1:** QA指摘内容/ユーザー指摘内容を受け取る

**Step 2:** infra-interface-designer-prompt.md に基づきサブエージェントを起動（fix モード）
- サブエージェントが以下を実行:
  1. 指摘内容の分析（修正が必要な箇所を特定）
  2. infra-interface-design.md の修正
  3. object-design-*.md との整合性確認
  4. 修正範囲が他フェーズに及ぶ場合はその旨を報告
  5. ユーザーへの提示と合意取得

**Step 3:** ユーザー合意の確認
- 合意あり → 完了
- 合意なし → 修正を再実行

### 完了条件

**create モード:**
1. `infra-interface-design.md` が作成されている
2. 以下のセクションが含まれている（該当するもの全て）:
   - 設計対象の一覧
   - API定義（該当する場合）
   - データストアスキーマ定義（該当する場合）
   - 外部サービス連携定義（該当する場合）
   - リポジトリ具象実装方針
   - データマッピングルール
3. DDD採用時: ドメインオブジェクトと永続化スキーマが分離されている
4. DDD採用時: APIのリクエスト/レスポンスにDTOが使用されている
5. object-design-*.md で定義された全リポジトリインターフェースの具象実装方針が定義されている
6. ユーザーが合意している

**delta モード:**
1. 差分設計書に infra-interface-design.md の変更内容が before→after 形式で記載されている
2. 変更内容が object-design-*.md と整合している
3. 影響範囲外のインターフェース仕様が変更されていない
4. ユーザーが合意している

**reverse モード:**
1. `infra-interface-design.md` が逆生成されている
2. コードの現実が正確に記録されている（理想化されていない）
3. ユーザーが合意している

**fix モード:**
1. 指摘内容に基づく修正が完了している
2. 修正後の内容が object-design-*.md と整合している
3. ユーザーが合意している

### ステータス返却方針

本スキルは明示的なステータス（DONE/SKIPPED）を返さない。完了条件の達成をもって呼び出し元フェーズスキルが完了を判断する。

### モード別の設計方針

| 設計方針 | create | delta | reverse | fix |
|---|---|---|---|---|
| **設計の基準** | オブジェクト設計のインターフェース定義に基づく | 変更要求の影響範囲に限定 | コードの現実をそのまま記録 | 指摘内容に基づく修正 |
| **新規インターフェースの追加** | 可（object-design-*.md に定義されているもの） | 可（変更要求で必要な場合） | 可（コードに存在するもの） | 不可 |
| **既存インターフェースの変更** | 該当なし（新規作成） | 可（影響範囲内のみ） | 不可（現実の記録） | 可（指摘箇所のみ） |
| **理想化・改善提案** | 可（設計段階のため） | 不可（変更要求の範囲内のみ） | 不可（現実の記録のため） | 不可（指摘対応のみ） |
| **具体的パラメータの決定** | 必須（タイムアウト値、リトライ回数等） | 変更対象のみ | コードから抽出（設定値をそのまま記録） | 指摘対象のみ |

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。スキルのルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「object-design-*.md にないインターフェースを追加しよう」（create モード） | インターフェースの追加はオブジェクト設計の範囲。矛盾がある場合はユーザーに報告する |
| 「ドメインオブジェクトをそのままAPIレスポンスに使おう」（DDD採用時） | DTOを使用する。ドメインオブジェクトの直接公開はレイヤー間依存違反 |
| 「データストアのスキーマをドメインモデルと同じ構造にしよう」（DDD採用時） | ドメインモデルと永続化スキーマは分離する |
| 「リポジトリの具象実装の詳細コードを書こう」 | 仕様の定義であり、実装コードは書かない |
| 「system-requirements.md にないデータストアを使おう」 | データストアの選定はシステム要件定義の範囲 |
| 「コードの理想的な設計を書こう」（reverse モード） | 現実のコードをそのまま記録する。改善は別のワークフローで行う |
| 「影響範囲外のインターフェースも改善しよう」（delta モード） | 変更要求の影響範囲内のみを変更する |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「API定義は実装時に決めればよい」 | API定義は設計段階で確定する。実装時の変更はフロントエンド/バックエンドの整合性を崩す |
| 「ファイルベースのスキーマは単純だから定義不要」 | ファイル形式・命名規則・排他制御方針は設計段階で定義する |
| 「外部サービスの仕様は外部に依存するから設計できない」 | ラッパーインターフェースとエラーハンドリング方針を定義する。外部依存だからこそ設計が重要 |
| 「リポジトリの具象実装方針はオブジェクト設計で定義済み」 | オブジェクト設計はインターフェース定義。本スキルは具象実装の方針（データマッピング、クエリ方針等）を定義する |
| 「DDD不採用だからデータマッピングは不要」 | DDD不採用でもサービス層のデータ構造と永続化形式の対応関係は明確にする |
| 「逆引きだから理想的な設計に直してよい」 | 逆引きは現実の記録。改善は別のワークフロー（変更・リファクタリング）で行う |

## Integration

**Called by:**
- `fs-design-phase9-infra` (aide-powers skill)（設計WF: create モード）
- `fs-change-phase2-impl` (aide-powers skill)（変更WF: delta モード）
- バグ修正ワークフロー差分設計フェーズ（delta モード）
- リファクタリングワークフロー差分設計フェーズ（delta モード）
- `fs-reverse-phase5-optional-phases` (aide-powers skill)（設計逆引きWF: reverse モード）

**Required workflow skills:**
- `git-commit-workflow` (aide-powers skill) — create/reverse モード完了時のコミット
- `doc-index-maintenance` (aide-powers skill) — create/reverse モード完了時のインデックス更新
- `pending-issues-management` (aide-powers skill) — 問題発見時に随時

**Related skills:**
- `object-design` (aide-powers skill) — インフラIF設計の前提となるインターフェース定義を提供する
- `program-structure-design` (aide-powers skill) — インフラIF設計の後にプログラム構成を確定する
- `design-sync` (aide-powers skill) — 実装中にインフラIF設計との乖離が発覚した場合の同期プロセス
- `doc-sync` (aide-powers skill) — ワークフロー最終フェーズでの設計書反映プロセス

**Input from caller:**
- `mode` — create / delta / reverse / fix
- `feature_name` — スペックディレクトリ名
- `specs_dir` — `.aide/specs/{feature_name}`
- `前フェーズ成果物パス` — user-requirements.md, system-requirements.md, system-architecture.md, gui-design.md, layered-architecture.md, object-design-domain.md, object-design-infrastructure.md（create モード）
- `change_requirements_path` — 変更要求ファイルパス（delta モード）
- `impact_analysis_path` — 影響分析結果ファイルパス（delta モード）
- `delta_design_path` — 差分設計書の出力先パス（delta モード）
- `program_structure_path` — program-structure.md のパス（reverse モード）
- `system_requirements_path` — system-requirements.md のパス（reverse モード）
- `qa_feedback` — QA指摘内容（fix モード）
