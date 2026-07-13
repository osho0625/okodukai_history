# 差分設計書

## 1. 設計方針

### 目的
リファクタリングWF（fs-refactoring-phase5-impl）の Step 3 を、他3FS（impl/change/bugfix）と同パターンの「サブエージェント起動型 動作確認試験」に引き上げる。

### 設計原則
1. **他3FSとの一貫性**: セクション構成・プレースホルダー方式・結果報告フォーマット・差し戻し情報を他3FSの verification-prompt.md と同一パターンに揃える
2. **リファクタリング固有観点の反映**: 「外部振る舞いが変わっていないこと」をメイン検証項目とし、セーフティネット再確認・リグレッション観点を追加
3. **FSの責務分離**: FS（オーケストレータ）はプレースホルダー置換→サブエージェント起動→結果受領→verification-report.md 存在確認のみ。直接試験実行は禁止

### 変更範囲
| ファイル | 変更種別 |
|---|---|
| `skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md` | 新規追加 |
| `skills/fs-refactoring-phase5-impl/SKILL.md` | 変更（Step 3 / Integration / 成果物テーブル） |

---

## 2. 新規追加の設計（refactoring-verification-prompt.md）

### ファイルパス
`skills/fs-refactoring-phase5-impl/refactoring-verification-prompt.md`

### 全体構成

以下のセクション構成で作成する。他3FSの共通パターンに準拠し、リファクタリング固有の試験観点を盛り込む。

---

#### セクション1: タイトルとエージェント役割宣言

```markdown
# 動作確認試験エージェント（リファクタリングWF用）

あなたは「動作確認試験エージェント」です。リファクタリングワークフローで内部構造が改善された
コードの外部振る舞いが変わっていないことを確認する動作確認試験を実行します。
```

---

#### セクション2: プレースホルダー

```markdown
## プレースホルダー（FSが実データで置き替える）

- `{{feature_name}}`: プロジェクト名
- `{{refactoring_dir}}`: リファクタリング作業ディレクトリのパス
- `{{refactoring_design_path}}`: refactoring-design.md のパス
- `{{implementation_summary}}`: 実装内容のサマリー（変更したファイル一覧・リファクタリング概要）
- `{{safety_net_result}}`: セーフティネット結果（coding-test-2review の出力から抽出した既存テスト全パスの確認結果）
- `{{dev_environment_path}}`: dev-environment.md のパス
- `{{startup_command}}`: アプリケーションの起動コマンド（判明している場合）
```

---

#### セクション3: 試験実行の優先順位

他3FSと同一の3段階優先順位を記載する:
1. 自分で動作確認する（必須）
2. Web アプリの場合は Playwright MCP を使ってブラウザ操作で確認する
3. どうしても自分で確認できない場合のみユーザーに依頼

「自分で確認できない場合の例」も他3FSと同一文言を使用する。

---

#### セクション4: ローカル/試験環境での実行制約

他3FSと同一の制約を記載する:
- ローカル環境または試験環境で実行
- 運用中のシステムに影響を与えてはならない
- dev-environment.md を参照

---

#### セクション5: 試験内容の定義（リファクタリング固有）

リファクタリングWFでは以下の **3種類** の試験を定義する:

##### 5.1 セーフティネット確認試験
- `{{safety_net_result}}` に基づき、既存テスト全パスが確認済みであることを前提とする
- 万一 coding-test-2review の結果に不整合がある場合は、既存テストを再実行して全パスを確認する

##### 5.2 外部振る舞い保持試験（メイン検証項目）
- refactoring-design.md（`{{refactoring_design_path}}`）の変更対象に基づき、以下を検証する:
  - リファクタリング対象の機能が従来と同じ外部振る舞いを保持していること
  - アプリケーションを実際に起動し、ユースケースシナリオを実行して確認する
  - 入出力インターフェース（API応答、画面表示、コマンド出力等）が変わっていないこと

##### 5.3 リグレッション確認試験
- リファクタリングによる内部構造変更に起因して既存機能が壊れていないことを確認する:
  - 変更部分の関連機能の動作確認
  - エッジケース・境界値の動作が適切であること
  - 変更モジュールを呼び出す上位モジュールの動作が正常であること

---

#### セクション6: 試験手順の雛形

他3FSと同一の4ステップ雛形:
1. 前提条件の準備
2. 操作の実行
3. 結果の確認（外部振る舞いが変わっていないことの照合）
4. 後処理

---

#### セクション7: 結果報告フォーマット

```
Status: OK / NG
試験実施方法: （AI自身で実行 / Playwright MCP / ユーザー依頼）
試験項目数: X件
パス: X件
失敗: X件
未実施: X件（理由付き）

【失敗項目の詳細（NG時のみ）】
- 項目名: ...
  期待結果: ...
  実際の結果: ...
  推定原因: （実装の問題 / 設計の問題）
```

---

#### セクション8: verification-report.md の出力フォーマット定義

出力先: `{{refactoring_dir}}/verification-report.md`

```markdown
# 動作確認試験書

## 試験概要
- 対象: {{feature_name}}
- WF種別: リファクタリングワークフロー
- 試験実施日時: YYYY-MM-DD HH:MM
- 試験実施方法: （AI自身で実行 / Playwright MCP / ユーザー依頼）
- 総合結果: OK / NG

## セーフティネット確認試験

| # | 試験項目 | 確認内容 | 結果 | 判定 |
|---|---|---|---|---|
| 1 | 既存テスト全パス | coding-test-2review で確認済み / 再実行結果 | ... | OK/NG |

## 外部振る舞い保持試験

| # | 対象機能 | シナリオ | 試験内容 | 試験手順 | 期待結果（従来と同じ動作） | 実際の結果 | 判定 |
|---|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | ... | OK/NG |

## リグレッション確認試験

| # | 試験項目 | 試験内容 | 試験手順 | 期待結果 | 実際の結果 | 判定 |
|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | OK/NG |

## NG項目の詳細（該当時のみ）

### NG-1: [項目名]
- 期待結果: ...
- 実際の結果: ...
- 推定原因: ...
- 推奨対応: ...
```

---

#### セクション9: NG時の差し戻し情報

```
【差し戻し推奨先】
- 実装の問題（コードの修正が必要）→ Step1（coding-test-2review）への差し戻しを推奨
- 設計の問題（リファクタリング設計自体に問題）→ Phase4（fs-refactoring-phase4-design）への差し戻しを推奨

【問題の分類】
- 問題種別: 実装の問題 / 設計の問題
- 問題の詳細: ...
- 修正に必要な作業の概要: ...
```

---

## 3. 既存変更の設計（SKILL.md）

### 3.1 成果物テーブルの変更

#### before
```markdown
# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 実装コード | refactoring-design.md で指定されたパス | リファクタリング対象の実装コード |
| テストコード | refactoring-design.md で指定されたパス | リファクタリングに伴うテストコード |
| fs-refactoring-phase5-report.txt | .aide/tmp/fs-refactoring-phase5-report.txt | fs-refactoring-phase5-implの実行レポート |
```

#### after
```markdown
# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| 実装コード | refactoring-design.md で指定されたパス | リファクタリング対象の実装コード |
| テストコード | refactoring-design.md で指定されたパス | リファクタリングに伴うテストコード |
| verification-report.md | {refactoring_dir}/verification-report.md | 動作確認試験書（Step 3 で出力） |
| fs-refactoring-phase5-report.txt | .aide/tmp/fs-refactoring-phase5-report.txt | fs-refactoring-phase5-implの実行レポート |
```

#### 変更理由
Step 3 でサブエージェントが出力する verification-report.md を成果物として明示するため。他3FSの成果物テーブルにも同様に verification-report.md が含まれている。

---

### 3.2 Step 3 の変更

#### before
```markdown
## Step 3: ユーザー動作検証依頼

### 成果物
fs-refactoring-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・リファクタリングが完了し動作可能な状態になったことをユーザーに報告し、動作検証を依頼した内容を記載する。伝える内容: 起動コマンド／変更内容（内部構造の改善内容）／確認してほしいポイント（外部振る舞いが変わっていないこと）／テスト実行結果（セーフティネットの全パス）
　動作検証依頼内容(Step3):

### 完了条件
fs-refactoring-phase5-report.txtに、動作検証依頼内容(Step3)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する
```

#### after
```markdown
## Step 3: 動作確認試験

### 成果物
fs-refactoring-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・リファクタリングされた機能の外部振る舞いが変わっていないことを動作確認する。本スキルディレクトリの `refactoring-verification-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを起動して動作確認試験を実行させる。サブエージェントの出力を"動作確認サブエージェントの出力(Step3):"として記載する。サブエージェントが {refactoring_dir}/verification-report.md を出力したことを確認する
　動作確認方法(Step3):（サブエージェント実行 / ユーザーに依頼）
　動作確認手順(Step3):（実行した試験内容の要約）
　動作確認結果(Step3):（OK: 全試験項目パス / NG: 問題あり）
　動作確認サブエージェントの出力(Step3):
・動作確認結果が OK の場合、ユーザーにリファクタリング内容と確認結果を報告し、ユーザーからの承認を得る
　ユーザー承認結果(Step3):（承認 / 追加確認要求 / NG）
　ユーザー承認の詳細(Step3):

> ⚠️ **動作確認の定義（build/テスト通過だけでは不可）:**
> 「動作確認」とは、**実際にアプリケーションを動作させ、リファクタリング対象の外部振る舞いが変わっていないことを確認し、セーフティネット（既存テスト全パス）の再確認とリグレッション確認を実行する**ことを意味する。build が通る・単体テストが通るだけでは動作確認とみなさない。
>
> **FSの責務:**
> FSの責務は「プロンプトテンプレート準備（プレースホルダー埋込）→ サブエージェント起動 → 結果受領 → verification-report.md 存在確認」に限定される。FS自身が直接試験を実行してはならない。
>
> **確認の優先順位（サブエージェントに委譲）:**
> 1. **サブエージェントが自分で動作確認する（必須）:** アプリケーションを起動し、リファクタリング対象の外部振る舞い保持を確認する
> 2. **Web アプリの場合は Playwright MCP を使って必ずブラウザ操作で確認する:** 画面遷移・ボタン操作・表示内容を実際に検証する
> 3. **どうしても自分で確認できない場合のみ:** ユーザーに動作確認を依頼し、ユーザーから「確認OK」の回答を得てから完了とする
>
> 自分で確認できない場合の例: 物理デバイスが必要、外部サービスとの連携が必要、特定の権限が必要 等
>
> **ローカル/試験環境での実行制約:**
> 動作確認はローカル環境または試験環境で実行し、運用中のシステムに影響を与えてはならない。

### 完了条件
fs-refactoring-phase5-report.txtに、動作確認結果(Step3)が「OK」であり、ユーザー承認結果(Step3)が「承認」であり、{refactoring_dir}/verification-report.md が存在すること

### 状態判定
- 動作確認結果(Step3)が「OK」かつユーザー承認結果(Step3)が「承認」の場合 → 後処理へ遷移する
- 動作確認結果(Step3)が「NG」の場合 → 問題の内容を分析し、以下のいずれかに遷移する:
　- 実装の問題（コードの修正が必要）→ Step1（coding-test-2review）へ差し戻し、追加修正タスクを refactoring-design.md に追記してから再実装する
　- 設計の問題（リファクタリング設計自体に問題）→ Phase4（fs-refactoring-phase4-design）へ差し戻す
- ユーザー承認結果(Step3)が「追加確認要求」の場合 → ユーザーが指定した追加確認を実施し、結果を報告して再度承認を求める
- ユーザー承認結果(Step3)が「NG」の場合 → ユーザーの指摘内容に基づき上記の差し戻しフローに従う
```

#### 変更理由
- **タイトル変更**: 「ユーザー動作検証依頼」→「動作確認試験」。他3FSのStep名（「動作検証・ユーザー確認」）と整合させ、サブエージェント起動型であることを示す
- **処理フロー変更**: ユーザーに報告するだけの簡易版から、refactoring-verification-prompt.md のプレースホルダーを実データで置換 → サブエージェント起動 → verification-report.md 出力 → ユーザー承認のフルフローに変更
- **成果物追加**: verification-report.md が Step 3 の成果物として生成される
- **完了条件の厳格化**: 動作確認結果「OK」+ ユーザー承認「承認」+ verification-report.md 存在の3条件を要求
- **状態判定の追加**: OK時は後処理遷移（変更なし）、NG時は差し戻し先判定（実装の問題→Step1、設計の問題→Phase4）を追加
- **FSの責務注記の追加**: 他3FSと同様の「⚠️ 動作確認の定義」注記を追加し、FSが直接試験を実行しないことを明示

---

### 3.3 Integration セクションの変更

#### before
```markdown
# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。内部で実装→テスト→レビュー→既存テスト全実行のセーフティネットを完結）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-refactoring-phase6-doc (aide-powers skill)`

**Called by:**
- `fs-refactoring-phase4-design (aide-powers skill)` → 設計QA APPROVED 後に本スキルに遷移

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。design-sync は本スキル内部で合理的乖離検出時に実行される）

**呼び出す名前付きエージェント（すべて coding-test-2review 経由・Step 1）:**
- `micro-impl-agent (aide-powers agent)` — coding-test-2review 経由（mode: implement / write_test / run_test / fix / fix_test）。本フェーズから直接呼び出さない
- `design-review-agent (aide-powers agent)` — coding-test-2review 経由（設計準拠レビュー combined）。直接呼び出し禁止
- `code-review-agent (aide-powers agent)` — coding-test-2review 経由（コード品質レビュー combined）。直接呼び出し禁止

**Input from caller:**
- `feature_name`: プロジェクト名
- `refactoring_dir`: 確定済みのリファクタリング成果物フォルダ（phase1 Step2 で確定。phase2 のフォルダ統合で移設される場合あり。phase1〜4 を通じて引き継がれた値）
- `doc_index_path`: doc-index.md のパス
- `bugfix_dir`: 過去不具合履歴ディレクトリ（`.aide/specs/{feature_name}/bugfix/`）。coding-test-2review に task_kind=`refactoring` とともに渡し、過去不具合の再混入検出（preservation check）に使用する

**Output to next phase:**
- `refactoring_dir`: 確定済みのリファクタリング成果物フォルダ

**Global rules:** `.aide/references/global-rules.md` を厳守
```

#### after
```markdown
# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。内部で実装→テスト→レビュー→既存テスト全実行のセーフティネットを完結）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-refactoring-phase6-doc (aide-powers skill)`

**Called by:**
- `fs-refactoring-phase4-design (aide-powers skill)` → 設計QA APPROVED 後に本スキルに遷移

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `coding-test-2review (aide-powers skill)` — Step 1（タスク実装ループ。design-sync は本スキル内部で合理的乖離検出時に実行される）

**サブエージェントプロンプト（本スキルディレクトリ内）:**
- `refactoring-verification-prompt.md` — Step 3（動作確認試験。プレースホルダーを実データで置換してサブエージェントに渡す）

**呼び出す名前付きエージェント（すべて coding-test-2review 経由・Step 1）:**
- `micro-impl-agent (aide-powers agent)` — coding-test-2review 経由（mode: implement / write_test / run_test / fix / fix_test）。本フェーズから直接呼び出さない
- `design-review-agent (aide-powers agent)` — coding-test-2review 経由（設計準拠レビュー combined）。直接呼び出し禁止
- `code-review-agent (aide-powers agent)` — coding-test-2review 経由（コード品質レビュー combined）。直接呼び出し禁止

**Input from caller:**
- `feature_name`: プロジェクト名
- `refactoring_dir`: 確定済みのリファクタリング成果物フォルダ（phase1 Step2 で確定。phase2 のフォルダ統合で移設される場合あり。phase1〜4 を通じて引き継がれた値）
- `doc_index_path`: doc-index.md のパス
- `bugfix_dir`: 過去不具合履歴ディレクトリ（`.aide/specs/{feature_name}/bugfix/`）。coding-test-2review に task_kind=`refactoring` とともに渡し、過去不具合の再混入検出（preservation check）に使用する

**Output to next phase:**
- `refactoring_dir`: 確定済みのリファクタリング成果物フォルダ

**Global rules:** `.aide/references/global-rules.md` を厳守
```

#### 変更理由
`refactoring-verification-prompt.md` をサブエージェントプロンプトとして Integration セクションに追加する。他3FSの SKILL.md でも同様に verification-prompt.md がサブエージェントプロンプトとして参照されている。追加位置は「呼び出す共通スキル」と「呼び出す名前付きエージェント」の間とし、本スキルディレクトリ内のリソースであることを明示する。

---

## 4. インターフェース影響サマリ

| 観点 | 影響 | 詳細 |
|---|---|---|
| Input from caller | なし | 変更なし（既存の feature_name, refactoring_dir, doc_index_path, bugfix_dir で足りる） |
| Output to next phase | なし | 変更なし（refactoring_dir のみ） |
| 前フェーズ（phase4）からの呼び出しIF | なし | 呼び出しパラメータに変更なし |
| 後フェーズ（phase6）への遷移IF | なし | 後処理の遷移条件に変更なし |
| 新規生成ファイル | あり | `{refactoring_dir}/verification-report.md` が Step 3 で生成される。phase7（final-check）が成果物確認範囲を列挙する際に影響する可能性あり（ただしスコープ外） |
| REQUIRED SKILL | なし | 追加なし（サブエージェントプロンプトは SKILL ではない） |

---

## 5. 更新が必要な設計資料

| 設計資料 | 更新内容 | 優先度 |
|---|---|---|
| program-structure.md | `#### fs-refactoring-phase5-impl` セクションのプロセス行・成果物行・プロンプトテンプレート行を更新（下記 before→after 参照） | 必須 |

### 5.1 program-structure.md の `#### fs-refactoring-phase5-impl` セクション更新

#### before
```markdown
#### fs-refactoring-phase5-impl
- 役割: リファクタリング実装ループ（coding-test-2review経由、セーフティネットテスト付き）
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review） → Step2: セーフティネット全テスト → Step3: ユーザー報告 → 後処理
- 成果物: 実装コード, テストコード, `fs-refactoring-phase5-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`
```

#### after
```markdown
#### fs-refactoring-phase5-impl
- 役割: リファクタリング実装ループ（coding-test-2review経由、セーフティネットテスト付き）
- プロセス: 前処理 → Step1: タスク実装ループ（coding-test-2review） → Step2: セーフティネット全テスト → Step3: 動作確認試験 → 後処理
- 成果物: 実装コード, テストコード, `verification-report.md`, `fs-refactoring-phase5-report.txt`
- 呼び出しスキル/エージェント: progress-resume-check, phase-report-check(verify/write), user-profile-management, coding-test-2review
- プロンプトテンプレート: `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`, `refactoring-verification-prompt.md`（Step3 動作確認サブエージェント委譲）
```

#### 変更理由
他3FS（impl/change/bugfix）の program-structure.md 記載では、各スキル詳細セクションにて verification-prompt.md と verification-report.md が個別に記載されている。本変更で fs-refactoring-phase5-impl にも同様にサブエージェント型動作確認試験を導入するため、以下3点を更新する:
- (a) プロセス行: 「Step3: ユーザー報告」→「Step3: 動作確認試験」（Step名称の変更を反映）
- (b) 成果物行: `verification-report.md` を追加（Step 3 でサブエージェントが出力）
- (c) プロンプトテンプレート行: `refactoring-verification-prompt.md`（Step3 動作確認サブエージェント委譲）を追加
