# 設計ワークフローのフェーズスキル

`fs-design-*` 一覧と各スキルの責務をまとめる（11 フェーズ + QA ゲート4か所）。
ワークフロー全体の流れと QA 体制は [`01-workflows/02-design.md`](../01-workflows/02-design.md) を参照。

## 一覧

| 順序 | スキル名 | 役割 | QA ゲート |
|---|---|---|---|
| 1 | `fs-design-phase1-user-req` | ユーザー要件定義（EARS + MoSCoW）。目的と手段の分離 | — |
| 2 | `fs-design-phase2-system-req` | システム要件 + 開発環境定義 | — |
| 3 | `fs-design-phase3-dev-plan` | 要件整合性検証 + 開発計画書作成 | **ゲート1**（要件定義レビュー） |
| 4 | `fs-design-phase4-architecture` | システム構成図 + ソフトウェアブロック図 | — |
| 5 | `fs-design-phase5-gui` | GUI 設計（GUI なしプロジェクトはスキップ） | — |
| 6 | `fs-design-phase6-usecase` | UC 一覧 → 詳細プロセス → 操作性評価 → 改善の 4 段階 | — |
| 7 | `fs-design-phase7-ddd` | DDD 採否判断 + レイヤード設計 + ユビキタス言語初期版 | **ゲート2**（アーキテクチャレビュー） |
| 8 | `fs-design-phase8-object` | ドメイン → アプリ → インフラ → プレゼン → サマリの 5 サブフェーズ | **ゲート3**（オブジェクト設計レビュー） |
| 9 | `fs-design-phase9-infra` | API / DB スキーマ / 外部連携 / リポジトリ実装 | — |
| 10 | `fs-design-phase10-program` | フォルダ配置 / import ルール / 命名規則 | **ゲート4**（最終設計レビュー + 設計網羅性確認） |
| 11 | `fs-design-phase11-final-check` | ワークフロー全体の最終整合性チェック | — |

## QA ゲートの位置

| ゲート | 配置 | 担当QAレビューアーエージェント |
|---|---|---|
| ゲート1 | フェーズ3完了後 | `requirements-qa-agent` |
| ゲート2 | フェーズ7完了後 | `architecture-qa-agent` |
| ゲート3 | フェーズ8完了後 | `object-design-qa-agent` |
| ゲート4 | フェーズ10完了後 | `final-design-qa-agent` |

ゲート呼び出しは `design-qa-dispatch` 共通スキルが集中管理する。
REJECTED の場合は対応するフェーズに戻り、修正後に **再 QA** を必ず実施する。

## fs-design-phase1-user-req

### 責務

ユーザーへのヒアリングを通じて要望を「目的」と「手段」に分離し、必須手段か一例かを確認したうえで
EARS 構文 + MoSCoW 分類で `user-requirements.md` を構造化する。手段・ロジック・パラメータは
抽象表現で記載し、具体値は載せない。

### Iron Law の代表ルール

- 目的と手段の分離なしに要件を確定しない。
- `user-requirements-definition` 共通スキルへの委譲を必須とする。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-design-phase2-system-req`

### 主要な共通スキル呼び出し

`user-requirements-definition`（create / fix モード）、`progress-resume-check`、
`rules-distribute`、`doc-index-maintenance`、`git-commit-workflow`。

## fs-design-phase2-system-req

### 責務

ユーザー要件を満たすための技術スタック・非機能要件・プラットフォーム制約を整理し、
`system-requirements.md` を作成する。同時に `dev-environment.md`（実行環境・テストコマンド・
依存管理方針）を作成し、実装系エージェントが必ず参照できる状態にする。

### Iron Law の代表ルール

- 開発環境定義の作成漏れ禁止（実装系エージェントの参照先がなくなる）。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-design-phase3-dev-plan`

### 主要な共通スキル呼び出し

`system-requirements-definition`（create / fix モード）、`tech-investigation`、
`doc-index-maintenance`、`git-commit-workflow`。

## fs-design-phase3-dev-plan

### 責務

ユーザー要件・システム要件の整合性を検証し、開発スコープ・進め方・体制を定義した
`development-plan.md` を作成する。完了時に **ゲート1** で `requirements-qa-agent` を呼び、
要件 4 ファイル（user-requirements / system-requirements / development-plan / dev-environment）の
品質を APPROVED / REJECTED 判定する。

### Iron Law の代表ルール

- ゲート1の REJECTED 後の再 QA を省略禁止。
- 要件レイヤーの品質基準を満たさずにゲート2へ進めない。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-design-phase4-architecture`（ゲート1 APPROVED 後）

### 主要な共通スキル呼び出し

`design-qa-dispatch`（→ `requirements-qa-agent`）、`doc-index-maintenance`、`git-commit-workflow`。

## fs-design-phase4-architecture

### 責務

システム全体構成図とソフトウェアブロック図を `system-architecture.md` に作成する。
構成図はテキストとビジュアルの両方で表現できるよう、`visual-companion` で図を提示しユーザーに確認する。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-design-phase5-gui`

### 主要な共通スキル呼び出し

`visual-companion`、`doc-index-maintenance`、`git-commit-workflow`。

## fs-design-phase5-gui

### 責務

GUI を持つプロジェクトの場合のみ、画面構成・遷移図・共通 UI ルールを `gui-design.md` に作成する。
GUI なしプロジェクトでは明示的にスキップ判定を残す。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-design-phase6-usecase`

### 主要な共通スキル呼び出し

`gui-design`（create / update モード）、`visual-companion`、`doc-index-maintenance`、
`git-commit-workflow`。

## fs-design-phase6-usecase

### 責務

ユースケース分析を 4 段階（一覧 → 詳細プロセス → 操作性評価 → 改善）で実施する。
共通スキル `usecase-analysis` に委譲し、`usecases/` 配下にユースケース別ファイルを作成。
ユーザー要件と GUI 設計を突き合わせ、操作性の問題を改善案にまとめる。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-design-phase7-ddd`

### 主要な共通スキル呼び出し

`usecase-analysis`、`doc-index-maintenance`、`git-commit-workflow`。

## fs-design-phase7-ddd

### 責務

DDD 採用判断を分析観点付きで明確化し、選択したアーキテクチャパターン（レイヤード / ヘキサゴナル /
オニオン / クリーン等）の根拠を `layered-architecture.md` に記載する。DDD 採用時は
`ubiquitous-language.md` の初期版も作成する。完了時に **ゲート2** で `architecture-qa-agent` を呼ぶ。

### Iron Law の代表ルール

- DDD 採否は分析観点と論理的根拠なしに決定しない。「なんとなく採用」は FAIL。
- ドメイン層の独立性、依存性逆転、テスト用ダミー実装方針を必ず定義する。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-design-phase8-object`（ゲート2 APPROVED 後）

### 主要な共通スキル呼び出し

`ddd-modeling`、`design-qa-dispatch`（→ `architecture-qa-agent`）、
`doc-index-maintenance`、`git-commit-workflow`。

## fs-design-phase8-object

### 責務

オブジェクト設計を 5 サブフェーズ（domain → app → infra → pres → summary）で実施し、
レイヤー別に `object-design-domain.md` / `object-design-application.md` /
`object-design-infrastructure.md` / `object-design-presentation.md` / `object-design.md` を作成。
完了時に **ゲート3** で `object-design-qa-agent` を呼ぶ。

### Iron Law の代表ルール

- ドメイン層への技術浸食禁止。
- ドメインモデル貧血症の禁止。
- 集約境界・テスタビリティ・ユビキタス言語整合性の確保。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-design-phase9-infra`（ゲート3 APPROVED 後）

### 主要な共通スキル呼び出し

`ddd-modeling`（domain サブフェーズ）、`object-design`（app / infra / pres サブフェーズ）、
`design-qa-dispatch`（→ `object-design-qa-agent`）、
`doc-index-maintenance`、`git-commit-workflow`。

## fs-design-phase9-infra

### 責務

API 定義・データストアスキーマ・外部サービス連携・リポジトリ実装を `infra-interface-design.md` に
作成する。オブジェクト設計のリポジトリインターフェースとの 1 対 1 対応を確保する。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-design-phase10-program`

### 主要な共通スキル呼び出し

`infra-interface-design`（create / fix モード）、`doc-index-maintenance`、`git-commit-workflow`。

## fs-design-phase10-program

### 責務

フォルダ配置・ファイル命名規則・import ルール（レイヤー依存方向）を `program-structure.md` に作成する。
完了時に **ゲート4** で `final-design-qa-agent` を呼び、インフラ IF 整合性 + プログラム構成網羅性 +
**全設計の網羅性確認**（ユーザー要件 → オブジェクト設計までトレースできるか）を判定する。

### Iron Law の代表ルール

- 全クラスのファイル配置漏れを 1 件でも検出すれば FAIL。抜き取りチェック禁止。
- import ルールがレイヤー依存方向と整合していなければ FAIL。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-design-phase11-final-check`（ゲート4 APPROVED 後）

### 主要な共通スキル呼び出し

`program-structure-design`、`design-qa-dispatch`（→ `final-design-qa-agent`）、
`doc-index-maintenance`、`git-commit-workflow`。

## fs-design-phase11-final-check

### 責務

設計ワークフローの最終フェーズスキル。`progress-final-checker` エージェントが全前フェーズの
署名（PHASE-SIG）を検証し、進捗ファイルの最終フェーズを ✅ 完了 に更新する。
PASS で完了（実装ワークフローへ引き継ぎ）、FAIL なら該当フェーズへ差し戻す。

### REQUIRED SUB-SKILL（次フェーズ）

なし（設計ワークフローの最終フェーズスキル）。完了後は実装ワークフローへ引き継ぐ。

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`（verify）、`progress-final-checker`（エージェント）。
