---
name: fs-refactoring-phase2-candidates
description: "Use when fs-refactoring-phase1-status completes with PASS and no handover (no refactoring-request.md)."
---

> **必須参照ルール:**
> 本フェーズスキルの実行中は、`.aide/references/phase-skill-rules.md` を必ず読み、
> その内容（前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など）に従うこと。
> これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

# リファクタリング フェーズ2: 対象特定

## Overview

既存コードを6つの分析観点で体系的に分析し、リファクタリングの候補を特定・優先順位付けする。ユーザーの希望があればそれを最優先候補とし、git blame による起因元ドキュメントフォルダの特定を行い、フェーズ完了後に folder-merge-check (aide-powers skill) 共通スキルでフォルダ統合判定を実行する。

**Core principle:** リファクタリングの成功は、正しい対象の選定から始まる。ユーザーの希望を最優先しつつ、6つの分析観点で体系的にコードを分析し、効果・コスト・リスクの定量評価に基づいて候補を優先順位付けせよ。

## 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| refactoring-candidates.md | `{refactoring_dir}/refactoring-candidates.md` | リファクタリング候補一覧（優先順位付き） |

## step-history-writer について

各 Step 完了時に `step-history-writer (aide-powers skill)` を activate して実行する。
このスキルはセッション履歴を `.aide/tmp/session-history-{skill_name}-{step_id}.txt` に書き出す。

呼び出しパラメータ:
- skill_name: fs-refactoring-phase2-candidates
- step_id: Step の識別子（例: `前処理`, `step1`, `step2` ...）
- step_title: Step のタイトル文字列
- artifact_dir: `{refactoring_dir}`（当該 WF の成果物フォルダパス。全 Step 共通）

## Process

### 前処理
1. progress-resume-check (aide-powers skill)（進捗ファイル再開チェック）
2. phase-compliance-check (aide-powers skill: verify)（前フェーズ署名検証）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase2-candidates`, step_id: `前処理`, step_title: `前処理`, artifact_dir: `{refactoring_dir}`

### Step 1: 作業ディレクトリの準備

- refactoring_dir = `.aide/specs/{feature_name}/refactoring/{YYYYMMDDHHmm}-{対処概略}(-{番号})/`
- `{YYYYMMDDHHmm}`: 作業開始日時（年月日時分）
- `{対処概略}`: リファクタリング内容を表す短い英語ケバブケース（例: `extract-service`, `reduce-coupling`）
- `(-{番号})`: 同じ日時・概略名のフォルダが既に存在する場合のみ付与（`-2`, `-3` 等）
- ディレクトリの作成はサブエージェントが refactoring-candidates.md を書き込む際に自動的に行われる

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase2-candidates`, step_id: `step1`, step_title: `作業ディレクトリの準備`, artifact_dir: `{refactoring_dir}`

### Step 2: refactoring-analyzer サブエージェントに対象特定を委譲する

- Task でサブエージェントをディスパッチする
- プロンプトテンプレート: refactoring-analyzer-prompt.md
- サブエージェントが実行する内容:
  - 2-1. 設計ドキュメントの読み込み（doc-index.md → 必須ドキュメント）
    - program-structure.md — ファイル構成・依存関係の把握
    - object-design-*.md — 既存クラス設計の把握
    - layered-architecture.md — レイヤー間依存ルールの把握
  - 2-2. ユーザー希望の確認
    - 希望あり → 最優先候補として記録 + 追加候補洗い出しの要否を確認
    - 希望なし → 全コードを分析対象とする
  - 2-3. コード分析（6つの観点）
    - 重複コード（DRY違反）
    - 長すぎるメソッド・クラス
    - 責務の混在（SRP違反）
    - 密結合（依存関係の問題）
    - テスタビリティの低さ
    - 拡張性の低さ
  - 2-4. 優先順位付け（効果・コスト・リスクの定量評価）
    - 効果: 高/中/低
    - コスト: 大/中/小
    - リスク: 高/中/低
    - 優先度: A+（ユーザー希望）/ A（推奨）/ B（検討）/ C（後回し）
  - 2-5. 起因元ドキュメントフォルダの特定
    - git blame → コミットメッセージの Docs: フッター追跡
    - ドキュメント内容と変更差分の照合による関連性検証
    - Docs: パスが見つかっただけで即座に起因元と判断しない（必ず検証）
  - 2-6. 成果物作成（refactoring-candidates.md）
  - 2-7. ユーザーに提示して選択

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase2-candidates`, step_id: `step2`, step_title: `refactoring-analyzer サブエージェントに対象特定を委譲する`, artifact_dir: `{refactoring_dir}`

### Step 3: サブエージェントの結果を確認する

- Read で refactoring-candidates.md が作成されているか確認する
- ユーザーが候補を選択しているか確認する

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase2-candidates`, step_id: `step3`, step_title: `サブエージェントの結果を確認する`, artifact_dir: `{refactoring_dir}`

### Step 4: folder-merge-check (aide-powers skill) 共通スキルの呼び出し（フォルダ統合判定）

- folder-merge-check (aide-powers skill) を実行する
- refactoring-candidates.md の「起因元ドキュメントフォルダ」セクションを確認
- 起因元ドキュメントフォルダあり:
  - folder-merge-check (aide-powers skill) 共通スキルが以下を実行:
    - 起因元フォルダの存在確認
    - ユーザーに統合の可否を確認
    - 承認時: ファイル移動 + refactoring_dir 切り替え
    - 拒否時: 新規フォルダで続行
  - → refactoring_dir 確定
- 起因元ドキュメントフォルダなし:
  - フォルダ統合判定をスキップ
  - → refactoring_dir 確定（新規フォルダのまま）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase2-candidates`, step_id: `step4`, step_title: `folder-merge-check 共通スキルの呼び出し（フォルダ統合判定）`, artifact_dir: `{refactoring_dir}`

### 後処理
1. doc-index-maintenance (aide-powers skill)
2. phase-compliance-check (aide-powers skill: write)
3. 次フェーズ遷移（REQUIRED SUB-SKILL: fs-refactoring-phase3-plan (aide-powers skill)）

> **step-history-writer (aide-powers skill)**: activate して実行。パラメータ — skill_name: `fs-refactoring-phase2-candidates`, step_id: `後処理`, step_title: `後処理`, artifact_dir: `{refactoring_dir}`

※ リファクタリングワークフローでは全フェーズ完了後に1回のみgitコミットを行う（フェーズ6で実施）。途中フェーズでのコミットは行わない。

### 6つの分析観点

| # | 観点 | 検出対象 | ユーザーへの説明 |
|---|---|---|---|
| 1 | 重複コード（DRY違反） | 同じ・似たロジックが複数箇所にある | 「同じような処理が何箇所にもコピーされている」 |
| 2 | 長すぎるメソッド・クラス | 1つのメソッド/クラスが多くの処理を行っている | 「1つのメソッド/クラスがやることが多すぎて、読みにくく変更しにくい」 |
| 3 | 責務の混在（SRP違反） | 1つのクラスが複数の異なる役割を持っている | 「1つのクラスがいろんなことをやりすぎている」 |
| 4 | 密結合（依存関係の問題） | クラス間の依存が強すぎる | 「あるコードを変えると、関係なさそうな別のコードも一緒に直さないといけない状態」 |
| 5 | テスタビリティの低さ | テストが書きにくい構造になっている | 「テストが書きにくい構造になっている（テストの書きやすさが低い）」 |
| 6 | 拡張性の低さ | 今後の変更が困難な箇所がある | 「今後新しい機能を追加するときに、既存のコードをたくさん書き換えないといけない構造」 |

### 優先順位付けの基準

| 優先度 | 判定基準 |
|---|---|
| A+（ユーザー希望） | ユーザーが指定した候補。評価結果に関わらず最優先 |
| A（推奨） | 効果が高く、コストが小〜中、リスクが低〜中 |
| B（検討） | 効果が中以上だが、コストまたはリスクが高い |
| C（後回し） | 効果が低い、またはコスト・リスクが見合わない |

### 完了条件

以下の全てが満たされた状態:

1. refactoring-candidates.md が作成されている
2. ユーザーが実施するリファクタリング候補を選択している
3. フォルダ統合判定が完了し、refactoring_dir が確定している
4. 次フェーズスキル（fs-refactoring-phase3-plan (aide-powers skill)）への遷移準備が整っている

## Red Flags - STOP

以下の思考パターンが浮かんだら **STOP**。プロセスを逸脱しようとしている。

| Red Flag | なぜ危険か |
|---|---|
| 「ユーザーが対象を指定しているから分析は不要」 | ユーザー希望を最優先候補としつつ、追加候補の洗い出しも提案すべき。ユーザーが気づいていない問題がある可能性がある |
| 「コードが小さいから分析は省略してよい」 | コードの規模に関わらず、6つの観点で体系的に分析する。小さなコードでも構造的な問題は存在しうる |
| 「git blame は時間がかかるから省略する」 | 起因元ドキュメントフォルダの特定はフォルダ統合判定の前提。省略するとドキュメントの一貫性が損なわれる |
| 「Docs: パスが見つかったから即座に起因元と判断する」 | Docs: パスが見つかっただけでは不十分。必ずドキュメント内容と変更差分を照合し、関連性を検証する |
| 「フォルダ統合判定は不要。新規フォルダで進めればよい」 | フォルダ統合判定は folder-merge-check (aide-powers skill) 共通スキルに委譲する。独自判断で省略してはならない |
| 「候補が多すぎるから上位3件だけ提示する」 | 上位5件程度に絞るのは許容されるが、3件以下への過度な絞り込みはユーザーの選択肢を狭める |

## Common Rationalizations

| Excuse | Reality |
|---|---|
| 「ユーザーの希望が明確だから他の候補は不要」 | ユーザーの希望を最優先しつつ、追加候補の洗い出しも提案する。ユーザーが判断材料を持てるようにする |
| 「設計書を読まなくてもコードだけで分析できる」 | 設計書（object-design-*.md, layered-architecture.md）を読まないと、レイヤー間の責務境界や設計意図を把握できない。誤った分析結果になる |
| 「効果・コスト・リスクの評価は主観的だから省略する」 | 定量評価は完璧でなくてよいが、ユーザーが判断するための材料として必須。省略するとユーザーが適切な選択をできない |
| 「起因元フォルダの検証は面倒だから Docs: パスをそのまま使う」 | 無関係な Docs: パスを起因元として記録すると、フォルダ統合判定で誤った統合が行われる。必ず検証する |

## Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-compliance-check (aide-powers skill)` — 進捗管理と実行整合性の確認。前処理（verify）と後処理（write）で必ず実行すること

**REQUIRED SUB-SKILL:**
- `fs-refactoring-phase3-plan (aide-powers skill)` — 次フェーズ: リファクタリング方針書

**Called by:**
- `fs-refactoring-phase1-status (aide-powers skill)` — REQUIRED SUB-SKILL として遷移される（通常起動時）

**Related skills:**
- `folder-merge-check (aide-powers skill)` — フォルダ統合判定（STEP 4 で呼び出す）
- `user-profile-management (aide-powers skill)` — **ユーザーとやり取りが発生するフェーズでは必ず activate して user-profile.md を確認し、会話内容の指針にすること。** apply モード: user-profile.md を読み込み（未作成なら会話から技術レベルを推定して作成）、説明粒度・専門用語・選択肢の提示方法をスコアに基づいて調整する。update モード: 会話中にスコアと実態の差異を感じたらスコアを更新する
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用。量が多い場合は積極的に活用すること

**Global rules:** `.aide/references/global-rules.md` を厳守
