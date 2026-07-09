---
name: fs-reverse-phase5-optional-phases
description: "Use when core reverse-design phases (1-4) are complete and optional analysis phases need to be evaluated and executed"
---


# 成果物

| 成果物 | パス | 説明 |
|---|---|---|
| layered-architecture.md | .aide/specs/{feature_name}/layered-architecture.md | レイヤードアーキテクチャ設計（オプション解析1実行時） |
| ubiquitous-language.md | .aide/specs/{feature_name}/ubiquitous-language.md | ユビキタス言語辞書（DDD採用/不採用に関わらず作成。不採用時は軽量な用語集） |
| object-design.md + object-design-*.md | .aide/specs/{feature_name}/object-design*.md | オブジェクト設計（オプション解析2実行時） |
| infra-interface-design.md | .aide/specs/{feature_name}/infra-interface-design.md | インフラIF設計（オプション解析3実行時） |
| gui-design.md | .aide/specs/{feature_name}/gui-design.md | GUI設計（オプション解析4実行時） |
| fs-reverse-phase5-report.txt | .aide/tmp/fs-reverse-phase5-report.txt | fs-reverse-phase5-optional-phasesの実行レポート |

※ 判定結果により実行対象のフェーズのみ成果物を作成する

# The Iron Laws

このスキルは、サブスキル、サブエージェントを実行するオーケストレータである。オーケストレータの役割は、サブスキル・サブエージェントを呼び出すことと、ユーザーの要求や質問に答えること。結果レポートを作成すること。fs-reverse-phase5-report.txt以外のファイルの書き出しは禁止。

- **オプションフェーズの実行/スキップ判定結果は、必ずユーザーに提示し承認を得てから進める。** 判定だけで勝手にオプションフェーズを開始してはならない
- **各オプションフェーズの成果物は、必ずユーザーに提示して合意を得てから次へ進む。** サブエージェント完了後の doc-index-maintenance / git-commit-workflow 呼び出しを省略してはならない
- **全フェーズ完了後の案内（生成ドキュメント一覧・次に利用可能なワークフロー）を省略してはならない**

# レポート運用ルール

fs-reverse-phase5-report.txt は本フェーズを通して単一ファイルを更新し続ける。

- 初回 Step（前処理）でファイルを新規作成し、以降の Step では同じファイルを更新する
- "現在のPhase:" / "現在のStep:" は毎 Step 上書き更新する（追記しない）
- 各 Step の結果項目は、その Step のセクションとして累積記録する（前 Step の記録は消さない）
- 各 Step の「成果物」に記載された項目は、上記ルールに従って fs-reverse-phase5-report.txt に反映する
- 各項目は値を記載する。値が空になる場合（該当なし・実行不要等）は空のままにせず**理由を記載する**（例: `進捗確認結果(前処理): PASS（前フェーズ fs-reverse-phase4-user-req の進捗確認済み）`）
- サブスキル・サブエージェントの実行結果（出力）は、実行した直後に即座に当該レポートへ記載する。フェーズ末尾にまとめて記載してはならない（進捗の正確性確保・記載漏れ防止のため）

# Process

## 前処理

### 成果物
fs-reverse-phase5-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（`.aide/specs/{feature_name}`）
・現在のPhase:
・現在のStep:
・`.aide/references/phase-skill-rules.md` を読み込み、内容に従う。読み込んだ内容から本フェーズ実行上の重要ポイントを3点に絞って記載する
　phase-skill-rules重要ポイント1(前処理):
　phase-skill-rules重要ポイント2(前処理):
　phase-skill-rules重要ポイント3(前処理):
・`.aide/references/global-rules.md` を読み込み、内容に従う。読み込んだ内容から本フェーズ実行上の重要ポイントを3点に絞って記載する
　global-rules重要ポイント1(前処理):
　global-rules重要ポイント2(前処理):
　global-rules重要ポイント3(前処理):
・progress-resume-check (aide-powers skill)を activate して実行し、出力を"progress-resume-checkの出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　再開ポイント(前処理):
　再開ポイント判定理由(前処理):
　引継ぎファイルがあれば内容の要約(前処理):
・phase-report-check (aide-powers skill: verify)を activate して実行し、出力を"phase-report-check(verify)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　前のフェーズ(前処理):
　前のフェーズ完了日時(前処理):
　進捗確認結果(前処理):
・user-profile-management (aide-powers skill: apply)を activate して実行し、出力を"user-profile-management(apply)の出力(前処理):"として記載する。その記載内容から、次の項目を判断して記載する
　ユーザーのドメイン知識レベル(前処理):
　ユーザーのプログラムスキルレベル(前処理):
　やり取り上の注意点要約(前処理):
・本フェーズを `RESUME_FROM`（N == 本フェーズ番号）で再開する場合に備え、フェーズ内のどの Step から再開するかを判定する。`.aide/specs/{feature_name}/session-handover.md`（あれば）と自フェーズの phase report（fs-reverse-phase5-report.txt。前回セッションのものが残っていれば）の "現在のStep:" を読み、中断していた Step があればその Step から、判定材料がなければ Step1 から再開すると判定し、結果を記載する（各オプションフェーズ単位の再開は Step1 で別途判定する）
　再開Step(前処理):

### 完了条件
fs-reverse-phase5-report.txtに、phase-skill-rules / global-rules の重要ポイントと、progress-resume-check / phase-report-check(verify) / user-profile-management(apply) を実行して得た上記項目（再開Step(前処理)含む）がすべて記載されている

### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する

・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（N はフェーズ番号。本フェーズ番号＝5）
  - `RESUME_FROM N`（N == 本フェーズ番号＝5）→ 本フェーズを実行する。フェーズ内のどの Step から再開するかは前処理で判定した "再開Step(前処理):" に従う
  - `RESUME_FROM N`（N > 本フェーズ番号）→ 後続フェーズスキル（`fs-reverse-phase6-final-check (aide-powers skill)` 等）へ遷移する
  - `RESUME_FROM N`（N < 本フェーズ番号）→ 異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-reverse-phase4-user-req (aide-powers skill)` に差し戻す
  - `START_FRESH`（新規開始）→ 本フェーズで START_FRESH は異常（前フェーズが未完了）。ユーザーに報告し、前フェーズスキル `fs-reverse-phase4-user-req (aide-powers skill)` に差し戻す
  - `ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

## Step 1: オプション進捗確認（途中再開対応）

### 成果物
fs-reverse-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・`.aide/specs/{feature_name}/reverse-progress.md` を読み取り、コアフェーズ（1〜4）が完了しているかを確認した結果を、次の項目で記載する
　reverse-progress.md存在(Step1):（あり / なし）
・各オプションフェーズ（オプション解析1〜4）の成果物ファイルの存在と git 履歴（コミット有無）を確認し、既に完了しているオプションフェーズを判定した結果を、次の項目で記載する。reverse-progress.md にはオプションフェーズ単位の完了は記録されないため（記録経路が存在しない）、オプションフェーズの再開判定は成果物の存在＋git 履歴で行う
　オプション成果物存在チェック結果(Step1):（オプション解析1: layered-architecture.md / オプション解析2: object-design.md + object-design-*.md / オプション解析3: infra-interface-design.md / オプション解析4: gui-design.md それぞれの有無）
　オプション成果物git履歴チェック結果(Step1):（上記各成果物が git にコミット済みか。`git log --oneline -- {成果物パス}` 等で確認）
　完了済みオプションフェーズ(Step1):（成果物が存在し、かつ git コミット済みのフェーズ。両方を満たすもののみ完了済みとみなす。なければ「なし」）
　再開対象フェーズ(Step1):（次に実行すべきフェーズ。全未着手なら「オプション解析1から」。本項目は再開状況を人間が把握するための情報用フィールドであり、後続 Step のゲート/分岐には使用しない。Step3 のスキップ判定は "完了済みオプションフェーズ(Step1):" と Step2 の確定実行フェーズに基づく）

### 完了条件
fs-reverse-phase5-report.txtに、reverse-progress.md の確認結果と各オプションフェーズの成果物存在＋git履歴チェック結果（上記項目）が記載されている

### 状態判定
完了条件を満たし、"reverse-progress.md存在(Step1):" を確認する

- なし の場合 → コアフェーズ（1〜4）が未完了の疑いがあるためユーザーに即通知し、前フェーズへ差し戻す
- あり の場合 → Step2 へ遷移する（"完了済みオプションフェーズ(Step1):" に記録されたフェーズは、成果物の存在と git コミットの両方により既完了と確認されているため、Step3 のループ内でスキップ（既完了）扱いとする）

## Step 2: オプションフェーズ実行判定とユーザー承認

### 成果物
fs-reverse-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `reverse-optional-phase-judge-prompt.md` のプレースホルダー（feature_name / specs_dir / 完了済みオプションフェーズ）を実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"オプション解析判定エージェントの出力(Step2):"として記載する。本エージェントは `program-structure.md` / `system-requirements.md` を解析し、下記「判定基準」に従って各オプションフェーズ（オプション解析1〜4）の実行/スキップを判定して返す（設計書は作成しない。要否判定のみ）。その出力から、次の項目を判断して記載する
　オプション解析1(アーキテクチャ)判定(Step2):（✅実行 / ⏭️スキップ）＋根拠
　オプション解析2(オブジェクト設計)判定(Step2):（✅実行 / ⏭️スキップ）＋根拠
　オプション解析3(インフラIF)判定(Step2):（✅実行 / ⏭️スキップ）＋根拠
　オプション解析4(GUI設計)判定(Step2):（✅実行 / ⏭️スキップ）＋根拠
・上記判定結果を下記「判定結果のユーザー提示フォーマット」でユーザーに提示し、承認を得た結果を、次の項目で記載する
　オプション判定のユーザー判断(Step2):（承認 / 修正要求）
　オプション判定の修正回数(Step2):
　オプション判定の修正内容要約(Step2):
　確定実行フェーズ一覧(Step2):（ユーザー承認後の最終的な実行対象フェーズ）

#### 判定基準

| # | オプションフェーズ | 判定対象 | 実行条件 | スキップ条件 | 判定方法 |
|---|---|---|---|---|---|
| 1 | アーキテクチャ（オプション解析1） | ディレクトリ構成 | レイヤーを示すディレクトリ構成がある（`domain/application/infrastructure/presentation`、`models/views/controllers`、`core/adapters/ports`、`entities/usecases/interfaces/frameworks`、`services/repositories/controllers` 等） | フラットな構成（全ファイルが同一ディレクトリ） | program-structure.md のフォルダ構成ツリーを解析 |
| 2 | オブジェクト設計（オプション解析2） | クラス定義 | クラスベースの設計（複数の class 定義、ABC/Protocol/dataclass/NamedTuple/Enum、型ヒント付きメソッドが存在） | 関数ベースのスクリプト的な構成 | program-structure.md の各ファイルの主要クラス/関数名を解析 |
| 3 | インフラIF（オプション解析3） | 外部連携 | 外部サービス連携・DB接続・ファイルI/O等のインフラ層が存在（sqlite3/sqlalchemy 等のDB、json/csv/yaml/toml の読み書き、requests/httpx 等の外部API、Repository 実装） | 外部連携がない純粋なロジックのみ | program-structure.md の import 情報と system-requirements.md のデータ管理方式を解析 |
| 4 | GUI設計（オプション解析4） | GUIフレームワーク | GUIフレームワークの import（tkinter/ttk、PyQt、PySide、wx、kivy、Web系 flask/django/fastapi+テンプレート、フロントエンド svelte/react/vue 等） | CLI / API のみ | program-structure.md の import 情報を解析 |

#### 判定結果のユーザー提示フォーマット

Step1 の "完了済みオプションフェーズ(Step1):" に記録されたフェーズは、ステータス列に「✅ 完了済み（前回実行・今回スキップ）」と表示し、今回は再実行せずスキップ（既完了）扱いとなることを提示に反映する。これにより提示内容と Step3 の実処理（スキップ（既完了））が一致する。

```
## オプションフェーズの実行判定結果

コードの構造を分析した結果、以下のように判定しました:

| # | オプションフェーズ | ステータス | 根拠 |
|---|---|---|---|
| 1 | アーキテクチャ抽出 | ✅ 実行 / ⏭️ スキップ（判定） / ✅ 完了済み（前回実行・今回スキップ） | {具体的な根拠} |
| 2 | オブジェクト設計抽出 | ✅ 実行 / ⏭️ スキップ（判定） / ✅ 完了済み（前回実行・今回スキップ） | {具体的な根拠} |
| 3 | インフラIF抽出 | ✅ 実行 / ⏭️ スキップ（判定） / ✅ 完了済み（前回実行・今回スキップ） | {具体的な根拠} |
| 4 | GUI設計抽出 | ✅ 実行 / ⏭️ スキップ（判定） / ✅ 完了済み（前回実行・今回スキップ） | {具体的な根拠} |

この判定でよろしいですか？
1. はい、この判定で進めてください
2. 修正があります（変更したいフェーズを教えてください）
3. その他（自由記述）
```

### 完了条件
fs-reverse-phase5-report.txtに各オプションフェーズの判定結果と根拠が記載され、"オプション判定のユーザー判断(Step2):" が承認であり、"確定実行フェーズ一覧(Step2):" が記録されている

### 状態判定
完了条件を満たしていればStep3へ遷移する。

- fs-reverse-phase5-report.txtの"オプション判定のユーザー判断(Step2):"が修正要求の場合 → 修正内容を `reverse-optional-phase-judge-prompt.md` に補足して再実行（または判定を見直し）、再度ユーザーに提示して Step2 を再実行する
- "オプション解析判定エージェントの出力(Step2):" のステータスが NEEDS_CONTEXT の場合 → 不足情報を補い `reverse-optional-phase-judge-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する

## Step 3: オプションフェーズ順次実行ループ

### 成果物
fs-reverse-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・Step2 で確定した実行対象フェーズを、下記「実行順序」に従って順番に処理する。各フェーズについて、次の項目を記載する（オプション解析1→2→3→4 の順）
　各フェーズの処理状況(Step3):（実行 / スキップ（判定スキップ） / スキップ（既完了））
・各実行対象フェーズについて、サブエージェント実行前に出力ファイルパスを記載する
　オプション解析の出力ファイルパス(Step3):（例: `.aide/specs/{feature_name}/layered-architecture.md`）
・各実行対象フェーズについて、対応するプロンプトテンプレート（下記表）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"{フェーズ名}逆引きエージェントの出力(Step3):"として記載する。サブエージェントは成果物を作成し、ユーザーと対話して合意を得る
・各実行対象フェーズの成果物についてユーザー合意を得た結果を"{フェーズ名}ユーザー合意(Step3):"として記載する
・各実行対象フェーズの成果物について doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"{フェーズ名}doc-index-maintenanceの出力(Step3):"として記載する
・各実行対象フェーズの成果物について git-commit-workflow (aide-powers skill)を activate して実行し、出力を"{フェーズ名}git-commit-workflowの出力(Step3):"として記載する

#### 実行順序とプロンプトテンプレート

| 順序 | フェーズ | プロンプトテンプレート | 成果物 |
|---|---|---|---|
| 1 | アーキテクチャ（オプション解析1） | `reverse-architecture-prompt.md` | `.aide/specs/{feature_name}/layered-architecture.md`, `.aide/specs/{feature_name}/ubiquitous-language.md`（DDD採用/不採用に関わらず作成。不採用時は軽量な用語集） |
| 2 | オブジェクト設計（オプション解析2） | `reverse-object-design-prompt.md` | `.aide/specs/{feature_name}/object-design.md` + `.aide/specs/{feature_name}/object-design-{layer}.md` |
| 3 | インフラIF（オプション解析3） | `reverse-infra-interface-prompt.md` | `.aide/specs/{feature_name}/infra-interface-design.md` |
| 4 | GUI設計（オプション解析4） | `reverse-gui-design-prompt.md` | `.aide/specs/{feature_name}/gui-design.md` |

各フェーズの処理判断:
- Step2 で「スキップ」と確定したフェーズ → スキップ報告して次へ（"処理状況:" に スキップ（判定スキップ）と記載）
- Step1 で既に完了済みと確認されたフェーズ → 次へ（"処理状況:" に スキップ（既完了）と記載）
- 上記以外 → サブエージェント実行・ユーザー合意・doc-index-maintenance・git-commit-workflow を実施

### 完了条件
fs-reverse-phase5-report.txtにおいて、確定実行フェーズすべてについて、サブエージェントの出力ステータスが DONE / DONE_WITH_CONCERNS であり、各成果物がファイルサイズ1byte以上で存在し、ユーザー合意・doc-index-maintenance・git-commit-workflow の実行が記録されている（スキップフェーズは処理状況にスキップ理由が記載されている）

### 状態判定
完了条件を満たしていればStep4へ遷移する。

- いずれかのフェーズのサブエージェントの出力ステータスが DONE_WITH_CONCERNS の場合 → 次へ進む前に懸念事項をユーザーに報告し対応方針を確認する
- NEEDS_CONTEXT の場合 → 不足情報を補い当該プロンプトテンプレートのプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- BLOCKED の場合 → ユーザーに報告し対応方針を確認する
- 各フェーズの成果物提示でユーザーが修正要求した場合 → 当該プロンプトテンプレートのプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行して修正後に再度合意を得る

なお、サブエージェントの再実行（リトライ）は各フェーズあたり最大2回までとし、それを超えても完了条件を満たさない場合はユーザーに報告し対応方針を確認する

## Step 4: 全フェーズ完了案内

### 成果物
fs-reverse-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・下記「生成ドキュメント一覧の提示」フォーマットで、生成済み/スキップを含む全ドキュメント一覧をユーザーに提示した結果を"生成ドキュメント一覧提示結果(Step4):"として記載する
・下記「次に利用可能なワークフローの案内」フォーマットで、次に利用可能なワークフローをユーザーに案内した結果を"次ワークフロー案内結果(Step4):"として記載する
・pending-issues-management (aide-powers skill)を activate して実行し、出力を"pending-issues-managementの出力(Step4):"として記載する。その記載内容から、次の項目を判断して記載する（「🚨 設計書未完了」の項目があれば削除、ファイルが空になれば削除）
　pending-issues解消結果(Step4):

#### 生成ドキュメント一覧の提示

```
## 設計逆引きが完了しました 🎉

以下のドキュメントが生成されました:

### コアドキュメント
| # | ファイル名 | 用途 |
|---|---|---|
| 1 | program-structure.md | プログラム構成（ファイル構成・依存関係） |
| 2 | dev-environment.md | 開発実行環境 |
| 3 | system-requirements.md | システム要件（技術スタック・非機能要件） |
| 4 | user-requirements.md | ユーザー要件 |

### オプションドキュメント
| # | ファイル名 | 用途 | ステータス |
|---|---|---|---|
| 5 | layered-architecture.md | レイヤードアーキテクチャ | ✅ 生成済み / ⏭️ スキップ |
| 6 | ubiquitous-language.md | ユビキタス言語辞書 | ✅ 生成済み / ⏭️ スキップ |
| 7 | object-design.md + object-design-*.md | オブジェクト設計 | ✅ 生成済み / ⏭️ スキップ |
| 8 | infra-interface-design.md | インフラIF設計 | ✅ 生成済み / ⏭️ スキップ |
| 9 | gui-design.md | GUI設計 | ✅ 生成済み / ⏭️ スキップ |

### メタドキュメント
| # | ファイル名 | 用途 |
|---|---|---|
| 10 | reverse-progress.md | 逆引きフェーズ進捗管理 |
| 11 | doc-index.md | ドキュメント一覧インデックス |
```

#### 次に利用可能なワークフローの案内

```
## 次のステップ

設計書が揃いましたので、以下のワークフローが利用可能です:

1. **実装ワークフロー** — 設計書に基づいてコードを実装する
2. **変更ワークフロー** — 機能追加・仕様変更を行う
3. **バグ修正ワークフロー** — バグを修正する
4. **リファクタリングワークフロー** — 内部構造を改善する
5. **設計ワークフロー** — 設計書の改善が必要な場合、該当フェーズで修正する

どのワークフローを実行しますか？
1. 実装ワークフロー
2. 変更ワークフロー
3. バグ修正ワークフロー
4. リファクタリングワークフロー
5. 設計ワークフロー（設計書の改善）
6. 今は何もしない
7. その他（自由記述）
```

### 完了条件
fs-reverse-phase5-report.txtに、生成ドキュメント一覧提示結果(Step4)・次ワークフロー案内結果(Step4)・pending-issues解消結果(Step4)が記載されている

### 状態判定
完了条件を満たしていれば後処理へ遷移する

## 後処理

### 成果物
fs-reverse-phase5-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・doc-index-maintenance (aide-powers skill)を activate して実行し、出力を"doc-index-maintenanceの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　doc-index更新内容(後処理):
・phase-report-check (aide-powers skill: write)を activate して実行し、出力を"phase-report-check(write)の出力(後処理):"として記載する。呼び出し時に progress_file_path=`.aide/specs/{feature_name}/reverse-progress.md` を渡す。その記載内容から、次の項目を判断して記載する
　フェーズ完了検証結果(後処理):
・user-profile-management (aide-powers skill: update)を activate して実行し、出力を"user-profile-management(update)の出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　プロフィール更新内容(後処理):
・git-commit-workflow (aide-powers skill)を activate して実行し、出力を"git-commit-workflowの出力(後処理):"として記載する。その記載内容から、次の項目を判断して記載する
　後処理のコミット結果(後処理):
・次フェーズ遷移先(後処理):

### 完了条件
fs-reverse-phase5-report.txtに、doc-index-maintenance / phase-report-check(write) / user-profile-management(update) / git-commit-workflow を実行して得た項目と次フェーズ遷移先(後処理)が記載されている

### 状態判定
完了条件を満たし、fs-reverse-phase5-report.txtの内容を確認し、さらに "フェーズ完了検証結果(後処理):" を確認する

- PASS の場合 → `fs-reverse-phase6-final-check (aide-powers skill)` を activate して実行する
- FAIL の場合 → ユーザーに即通知し、本フェーズの未実行 Process を再実行する

注: 設計逆引きワークフローは各フェーズの後処理でコミットする方式（各フェーズコミット型）である。本フェーズでも、各オプション解析完了時（Step3）と後処理（phase-report-check(write) の後）でコミットを行う。

# Integration

**REQUIRED SKILL（必須・省略禁止）:**
- `phase-report-check (aide-powers skill)` — 前処理（verify）と後処理（write）

**REQUIRED SUB-SKILL（次フェーズ）:**
- `fs-reverse-phase6-final-check (aide-powers skill)`（進捗ファイル完全性チェック）

**Called by:**
- `fs-reverse-phase4-user-req (aide-powers skill)` → REQUIRED SUB-SKILL として遷移

**呼び出す共通スキル:**
- `progress-resume-check (aide-powers skill)` — 前処理
- `phase-report-check (aide-powers skill: verify)` — 前処理
- `user-profile-management (aide-powers skill)` — 前処理 (apply) / 後処理 (update)
- `doc-index-maintenance (aide-powers skill)` — 各オプション解析完了時（Step3）・後処理
- `git-commit-workflow (aide-powers skill)` — 各オプション解析の doc-index-maintenance 完了後（Step3）・後処理
- `pending-issues-management (aide-powers skill)` — Step4（設計書未完了の pending-issues がある場合、解消を記録）
- `phase-report-check (aide-powers skill: write)` — 後処理
- `visual-companion (aide-powers skill)` — モックアップ・図表・選択肢の視覚的提示。アーキテクチャのレイヤー構成図・依存方向図、オブジェクト設計のクラス図、GUI設計の画面レイアウトモックアップ等、イメージで見せた方がわかりやすい場面では積極的に活用すること
- `task-orchestration (aide-powers skill)` — 複数ファイルの一括処理・大量の繰り返しタスク・複雑なタスクの分解が必要な場面で使用

**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `reverse-optional-phase-judge-prompt.md` — Step 2（オプションフェーズ要否判定）
- `reverse-architecture-prompt.md` — Step 3（オプション解析1: アーキテクチャ）
- `reverse-object-design-prompt.md` — Step 3（オプション解析2: オブジェクト設計）
- `reverse-infra-interface-prompt.md` — Step 3（オプション解析3: インフラIF）
- `reverse-gui-design-prompt.md` — Step 3（オプション解析4: GUI設計）

**Input from caller:**
- `feature_name`: プロジェクト名

**Output to next phase:**
- 生成済みオプション設計書一覧

**Global rules:** `.aide/references/global-rules.md` を厳守
