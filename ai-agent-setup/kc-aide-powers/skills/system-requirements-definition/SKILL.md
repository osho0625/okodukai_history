---
name: system-requirements-definition
description: "Use when defining or updating system requirements including tech stack, non-functional requirements, and development environment constraints."
---

# システム要件定義

## Overview

**Core principle:** ユーザーにヒアリングしてから決定する。AIが勝手にシステム要件を決めない。逆引きモードではコードの現実を記録する。

技術スタック・非機能要件・開発環境を定義する共通スキルである。4つのモード（create / reverse / delta / fix）を持ち、設計ワークフロー・設計逆引きワークフロー・変更ワークフロー等から呼び出される。

## Process

### モード判定

呼び出し元から渡された `mode` パラメータに基づき、以下のいずれかのモードで実行する。

### create モード（新規作成）

**Step 1:** system-requirements-architect-prompt.md に基づきサブエージェントを起動
- Task でサブエージェントをディスパッチする
- サブエージェントが以下を実行:
  1. user-requirements.md を読み込み、Must要件すべてを把握する
  2. ユーザーにヒアリング（質問は1つずつ、10項目）
  3. 実現手段の検討（選定理由を明記）
  4. 制限事項・セキュリティ要件・非機能要件の整理
  5. ログ出力方針の定義（必須記載ルール6項目厳守）
  6. 開発環境の標準化（仮想環境利用有無の確認必須）
  7. system-requirements.md の作成
  8. dev-environment.md の作成（別ファイルとして必ず作成）
  9. ユーザーに提示し合意を得る

**Step 2:** ユーザー合意の確認
- 合意あり → 完了
- 合意なし → サブエージェントに修正を指示し、Step 1に戻る

### reverse モード（逆引き）

**Step 1:** reverse-system-requirements-prompt.md に基づきサブエージェントを起動
- Task でサブエージェントをディスパッチする
- サブエージェントが以下を実行:
  1. program-structure.md と dev-environment.md を読み込む
  2. アプリケーション形態の特定（import文から判定）
  3. 技術スタックの抽出（依存パッケージ + import文から分類）
  4. データ管理方式の抽出（DB / ファイル / メモリ）
  5. エラーハンドリング方針の抽出
  6. ログ出力方針の抽出
  7. セキュリティ要件・非機能要件の抽出
  8. system-requirements.md の作成
  9. ユーザーに提示し合意を得る

**Step 2:** ユーザー合意の確認
- 合意あり → 完了
- 合意なし → サブエージェントに修正を指示し、Step 1に戻る

### delta モード（差分更新）

**Step 1:** 既存の system-requirements.md を Read で読み込む

**Step 2:** 変更要求を Read で読み込む
- change-requirements.md / fix-plan.md / refactoring-plan.md のいずれか

**Step 3:** 影響箇所の特定
- 変更がシステム要件のどのセクションに影響するかを特定する（技術スタック追加、非機能要件変更、セキュリティ要件追加等）

**Step 4:** 差分設計の作成
- before → after 形式で変更内容を記述する
- 変更理由を明記する
- delta-design.md の一部として出力する

**Step 5:** ユーザーに提示し合意を得る

### fix モード（QA指摘修正、create/reverse 共通）

**Step 1:** QA指摘内容を受け取る

**Step 2:** system-requirements.md / dev-environment.md の該当箇所を修正する
- ログ出力方針の6項目が不足している場合は補完する
- 外部パッケージと外部サービスの混同がある場合は分離する
- その他QA指摘事項を修正する

**Step 3:** ユーザーに提示し合意を得る
- 合意あり → 完了
- 合意なし → 修正を再実行

### 全モード共通の厳守ルール

#### ログ出力方針の必須記載ルール

以下の6項目すべてを具体的に記載する。省略・簡略化は禁止:

1. **ログライブラリ**: 使用するログライブラリ名（言語標準のログライブラリを使用すること）
2. **ログレベル定義**: DEBUG / INFO / WARNING / ERROR の具体例付き定義
3. **ログ出力先**: コンソール、ファイル、外部サービス等
4. **ログフォーマット**: タイムスタンプ、レベル、モジュール名等の形式
5. **本番時のログレベル**: 本番環境でのデフォルトログレベル
6. **デバッグ時の切り替え方法**: ログレベルの動的切り替え手段

#### dev-environment.md の分離ルール

- dev-environment.md は system-requirements.md とは**別ファイル**として必ず作成する（create モード）
- コンテキスト汚染の防止のため、1ファイルに統合してはならない

#### Python + venv 環境のルール

- Pythonプロジェクトで venv（仮想環境）を用意している場合、dev-environment.md に以下を必ず記載すること:
  - **グローバルの python / pip の使用禁止**: 必ず venv 内の python / pip を使用する
  - venv の activate 方法（パス）
  - venv 内の python / pip の実行パス例（例: `.venv/bin/python`, `.venv/Scripts/python`）
  - 「グローバル環境への pip install を絶対に行わないこと」の明記

#### 外部パッケージと外部サービスの混同禁止

- **外部パッケージ**: パッケージマネージャでインストールするライブラリ（pip, npm, cargo 等）
- **外部サービス**: ネットワーク経由で利用するAPI・クラウドサービス
- それぞれ個別にユーザーに確認・記載すること。混同は禁止

### 完了条件

**create モード:**
1. system-requirements.md が作成されていること
2. dev-environment.md が作成されていること（別ファイル）
3. user-requirements.md のMust要件すべてに対応するシステム要件が定義されていること
4. ログ出力方針の6項目すべてが具体的に記載されていること
5. ユーザーの合意を得ていること

**reverse モード:**
1. system-requirements.md が作成されていること
2. 必須セクション（システム構成概要、技術スタック、データ管理、エラーハンドリング方針、ログ出力方針）が含まれていること
3. コードの現実が正確に記録されていること（理想の設計ではない）
4. ユーザーの合意を得ていること

**delta モード:**
1. 変更箇所が before → after 形式で明確に記述されていること
2. 変更理由が明記されていること
3. ユーザーの合意を得ていること

**fix モード:**
1. QA指摘事項が全て対応されていること
2. ユーザーが修正内容に合意していること

### ステータス返却方針

本スキルは明示的なステータス（DONE/SKIPPED）を返さない。完了条件の達成をもって呼び出し元フェーズスキルが完了を判断する。

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。スキルのルールを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「個人利用だからログ方針は簡易でよい」 | ログ出力方針の必須記載ルールに違反。個人利用でも6項目すべてを具体的に記載する |
| 「printで十分だからloggingは不要」 | 言語標準のログライブラリを使用すること。print によるログ出力は禁止 |
| 「外部サービスへの依存なし = 外部パッケージも使わない」 | 外部パッケージと外部サービスは別概念。それぞれ個別にユーザーに確認する |
| 「ユーザーが技術に詳しいからヒアリングは省略」 | ヒアリングは必須。AIが勝手にシステム要件を決めない |
| 「dev-environment.md は system-requirements.md に含めれば十分」 | 別ファイルとして必ず作成する。コンテキスト汚染の防止のため |
| 「Must要件の一部はシステム要件で対応不要」 | Must要件すべてに対応するシステム要件を定義する義務がある |
| 「コードにログ出力が print のみだが、logging を使うべきと記載しよう」（reverse モード） | 逆引きは現実の記録。実装されていないパターンを記載してはならない |
| 「差分が小さいからシステム要件の更新は不要」（delta モード） | 影響があると判定された以上、差分設計を作成する |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「標準的なログ出力で十分」 | 曖昧な記述は禁止。具体的なライブラリ名、レベル定義、出力先を明記する |
| 「オーバーエンジニアリングになる」 | 要件に見合った技術選定を行うが、ログ方針等の必須項目は省略できない |
| 「ユーザーが決めてくれるから質問は不要」 | ヒアリングは必須プロセス。質問を通じて要件を明確化する |
| 「前のプロジェクトと同じ構成でよい」 | プロジェクトごとに要件は異なる。必ずヒアリングして確認する |
| 「逆引きだから理想的な構成を提案すべき」 | 逆引きはコードの現実を記録する。改善提案は別途コメントとして記載可 |

## Integration

**Called by:**
- `fs-design-phase2-system-req` (aide-powers skill)（設計WF: create モード）
- `fs-reverse-phase3-system-req` (aide-powers skill)（設計逆引きWF: reverse モード）
- `fs-change-phase2-impl` (aide-powers skill)（変更WF: delta モード）
- `fs-bugfix-phase2-impl` (aide-powers skill)（バグ修正WF: delta モード）
- `fs-refactoring-phase4-design` (aide-powers skill)（リファクタリングWF: delta モード）

**Common skills used internally:**
- なし（このスキル自体が共通スキルであり、内部で他の共通スキルは呼び出さない）

**Related skills:**
- `tech-investigation` (aide-powers skill) — 技術選定時に調査が必要な場合に利用可能（1%ルール自動発動）
- `user-requirements-definition` (aide-powers skill) — 前フェーズの成果物（user-requirements.md）を入力として使用
- `doc-index-maintenance` (aide-powers skill) — 成果物作成後のインデックス更新（呼び出し元フェーズスキルの責務）
- `git-commit-workflow` (aide-powers skill) — 成果物のコミット（呼び出し元フェーズスキルの責務）

**Input from caller:**
- `mode` — create / reverse / delta / fix
- `feature_name` — スペックディレクトリ名
- `specs_dir` — `.aide/specs/{feature_name}`
- `user_info` — ユーザーの要望・回答（create モード）
- `program_structure_path` — program-structure.md のパス（reverse モード）
- `dev_environment_path` — dev-environment.md のパス（reverse モード）
- `change_requirements_path` — 変更要求ドキュメントのパス（delta モード）
- `existing_system_requirements_path` — 既存 system-requirements.md のパス（delta モード）
- `qa_feedback` — QA指摘内容（fix モード）
