# 設計逆引きワークフローのフェーズスキル

`fs-reverse-*` 一覧と各スキルの責務をまとめる。
ワークフロー全体の流れは [`01-workflows/04-reverse.md`](../01-workflows/04-reverse.md) を参照。

## 一覧

| 順序 | スキル名 | 役割 |
|---|---|---|
| 1 | `fs-reverse-phase1-program` | 既存コードベースを 3 パスで解析し `program-structure.md` を生成 |
| 2 | `fs-reverse-phase2-dev-env` | 設定ファイルから `dev-environment.md` を抽出 |
| 3 | `fs-reverse-phase3-system-req` | コードの現実から `system-requirements.md` を抽出 |
| 4 | `fs-reverse-phase4-user-req` | コード挙動 + ヒアリングで `user-requirements.md` を生成（コア完了） |
| 5 | `fs-reverse-phase5-optional-phases` | アーキテクチャ / オブジェクト / インフラ IF / GUI のオプション逆生成 |
| 6 | `fs-reverse-phase6-final-check` | ワークフロー全体の最終整合性チェック |

## fs-reverse-phase1-program

### 責務

既存コードベースをファイル → モジュール → ディレクトリの 3 パスで解析し、
フォルダ配置・ファイル一覧・依存関係を `program-structure.md` に書き起こす。

### Iron Law の代表ルール

- コードの現実を記録する。理想のプログラム構成を書かない。
- 推測した部分は明示する。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-reverse-phase2-dev-env`

### 主要な共通スキル呼び出し

`program-structure-design`（reverse モード）、`progress-resume-check`、
`rules-distribute`、`doc-index-maintenance`、`git-commit-workflow`。

## fs-reverse-phase2-dev-env

### 責務

`package.json` / `pyproject.toml` / `Makefile` / `.python-version` / `Dockerfile` 等の設定ファイルから
言語バージョン・依存管理方針・テスト実行コマンドを抽出し、`dev-environment.md` に書き起こす。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-reverse-phase3-system-req`

### 主要な共通スキル呼び出し

`doc-index-maintenance`、`git-commit-workflow`。

## fs-reverse-phase3-system-req

### 責務

コードの実態から技術スタック・非機能要件・エラーハンドリング方針を抽出して
`system-requirements.md` を作成する。コードに該当しない理想的な要件は記載しない。

### Iron Law の代表ルール

- 実装されていない要件を「あるべき姿」として書かない。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-reverse-phase4-user-req`

### 主要な共通スキル呼び出し

`system-requirements-definition`（reverse モード）、`doc-index-maintenance`、`git-commit-workflow`。

## fs-reverse-phase4-user-req

### 責務

コード挙動からユーザー要件を推測したうえで、ユーザーヒアリングで補完・確定し、
`user-requirements.md` を生成する。**このフェーズで設計逆引きワークフローのコアが完了**する。

### Iron Law の代表ルール

- 推測内容を確認なしに確定しない。必ずユーザーヒアリングで補完する。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-reverse-phase5-optional-phases`

### 主要な共通スキル呼び出し

`user-requirements-definition`（reverse モード）、`doc-index-maintenance`、
`git-commit-workflow`、`user-profile-management`。

## fs-reverse-phase5-optional-phases

### 責務

コード構造を分析し、オプションフェーズ（アーキテクチャ / オブジェクト設計 / インフラ IF / GUI）の
実行可否を判定して必要なものだけ順次実行する。実装が存在しないものは明示的にスキップ。
最後に生成済みドキュメント一覧と次に利用可能なワークフロー（変更 / バグ修正 / リファクタリング / 実装）を
ユーザーに提示する。

### Iron Law の代表ルール

- レイヤー分離が読み取れないのにアーキテクチャ設計書を作らない。
- クラスベース設計が検出されないのにオブジェクト設計書を作らない。

### REQUIRED SUB-SKILL（次フェーズ）

`fs-reverse-phase6-final-check`

### 主要な共通スキル呼び出し

`ddd-modeling`（reverse モード）、`object-design`（reverse モード）、
`infra-interface-design`（reverse モード）、`gui-design`（reverse モード）、
`doc-index-maintenance`、`git-commit-workflow`、`pending-issues-management`。

## fs-reverse-phase6-final-check

### 責務

設計逆引きワークフローの最終フェーズスキル。`progress-final-checker` エージェントが全前フェーズの
署名（PHASE-SIG）を検証し、進捗ファイルの最終フェーズを ✅ 完了 に更新する。
PASS で完了、FAIL なら該当フェーズへ差し戻す。

### REQUIRED SUB-SKILL（次フェーズ）

なし（設計逆引きワークフローの最終フェーズスキル）。

### 主要な共通スキル呼び出し

`progress-resume-check`、`phase-compliance-check`（verify）、`progress-final-checker`（エージェント）。
