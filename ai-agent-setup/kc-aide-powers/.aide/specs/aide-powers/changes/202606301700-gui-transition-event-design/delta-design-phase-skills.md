# 差分設計書: フェーズスキルの変更

対象REQ-C: 006, 007, 008

---

## REQ-C-006: fs-design-phase6-usecase への fixモード追加

### 変更対象ファイル

- `skills/fs-design-phase6-usecase/SKILL.md`

---

### 1. 前処理の状態判定に fixモード分岐を追加

#### 変更理由

後工程（GUI設計・オブジェクト設計・QAレビュー等）から「ユースケース分析に不足がある」と差し戻された場合に、fixモードで当該フェーズを再実行する仕組みを追加する。fs-design-phase8-objectスキルが既に持つfixモードパターン（QAゲート4 REJECTED差し戻し）を横展開する。

#### before

```markdown
### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（`.aide/specs/{feature_name}/usecases/`）
・現在のPhase:
・現在のStep:
・`.aide/references/phase-skill-rules.md` を読み込み、内容に従う。読み込んだ内容から本フェーズ実行上の重要ポイントを3点に絞って記載する
```

#### after

```markdown
### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・成果物出力先フォルダ(前処理):（`.aide/specs/{feature_name}/usecases/`）
・現在のPhase:
・現在のStep:
・実行モード(前処理):（通常（呼び出し元 mode=phase6）/ fix（QAゲート差し戻し: 呼び出し元 mode=fix、fix対象・qa_feedback あり））
・`.aide/references/phase-skill-rules.md` を読み込み、内容に従う。読み込んだ内容から本フェーズ実行上の重要ポイントを3点に絞って記載する
```

---

### 2. 状態判定セクションへの fixモード分岐追加

#### 変更理由

fixモードで呼び出された場合、通常のStep1からの実行ではなく、不足と判定された観点に絞った再分析・補完を行うfixステップに直接遷移する。

#### before

```markdown
### 状態判定
完了条件を満たしたうえで、まず "進捗確認結果(前処理):" を確認する
・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 6）
　・`START_FRESH`（新規開始）→ 異常（前フェーズ1〜5の成果物が未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase5-gui (aide-powers skill)` に差し戻す
　・`RESUME_FROM N`（N==6、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
　・`RESUME_FROM N`（N>6、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
　・`RESUME_FROM N`（N<6、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase5-gui (aide-powers skill)` に差し戻す
　・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

**Step途中再開判定（本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase6-usecase-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する。
```

#### after

```markdown
### 状態判定
完了条件を満たしたうえで、まず "実行モード(前処理):" を確認する。

- **実行モードが fix（QAゲート差し戻し）の場合:**
  - progress-resume-check による再開判定および後述の Step途中再開判定をスキップする（再入時に progress-resume-check が ALL_COMPLETED を返して終了に落ちるのを防ぐ）
  - QAゲートから渡された fix対象（不足と判定された観点）と qa_feedback を用いて Step Fix を直接実行する
  - fix 完了後:
    - 後続フェーズへ前進遷移しない
    - 後処理・コミットも実行しない
    - 呼び出し元に制御を戻す（再QAレビューのため）

- **実行モードが通常の場合:**
  "進捗確認結果(前処理):" を確認する
  ・FAIL の場合 → ユーザーに即通知し、対応方針はユーザーが決定する
  ・PASS の場合 → 次に "再開ポイント(前処理):" の内容で遷移先を決める（`RESUME_FROM N` の N はフェーズ番号を表す。本フェーズのフェーズ番号は 6）
　  ・`START_FRESH`（新規開始）→ 異常（前フェーズ1〜5の成果物が未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase5-gui (aide-powers skill)` に差し戻す
　  ・`RESUME_FROM N`（N==6、本フェーズ番号）→ 本フェーズを実行する（フェーズ内のどの Step から再開するかは下記「Step途中再開判定」で決める）
　  ・`RESUME_FROM N`（N>6、後続フェーズ）→ 該当する後続フェーズスキルへ遷移する
　  ・`RESUME_FROM N`（N<6、前フェーズ）→ 異常（前フェーズ未完了）。ユーザーに報告し、前フェーズスキル `fs-design-phase5-gui (aide-powers skill)` に差し戻す
　  ・`ALL_COMPLETED`（全フェーズ完了済み）→ ユーザーに案内しワークフロー終了

  **Step途中再開判定（通常モードで本フェーズを実行する場合）:** .aide/specs/{feature_name}/session-handover.md（存在すれば）と fs-design-phase6-usecase-report.txt の "現在のStep:" を読み、中断していた Step から再開する。いずれも無ければ Step1 から開始する。判定結果を "再開Step(前処理):" としてレポートに記載する（fix モード時はこの判定をスキップし fix Step を直接実行する）。
```

---

### 3. Step Fix の追加（fixモード専用ステップ）

#### 変更理由

fixモードで呼び出された場合に実行する専用ステップを追加する。不足と判定された観点を指定して、該当部分のみを再分析・補完する。Step7（ユーザー最終承認）の後、後処理の前に配置する。

#### before

（Step Fix は存在しない）

#### after

Step7 と後処理の間に以下を追加する:

```markdown
## Step Fix: fixモード — 差し戻し補完（fixモード時のみ実行）

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・fix対象(Step Fix): {qa_feedbackから抽出した不足観点の要約}
・qa_feedback内容(Step Fix): {呼び出し元から渡されたQAフィードバック全文}
・fix対象に応じて以下を実行する:
  - UC追加が必要な場合: `usecase-lister-prompt.md`（mode: fix）で不足UCを追加し、追加したUCについて `usecase-process-analyzer-prompt.md`（mode: fix）で実現プロセスを定義する
  - 既存UCの粒度が粗い場合: 対象UCについて `usecase-process-analyzer-prompt.md`（mode: fix）で再分析する
  - イベント制御に関するUC不足の場合: gui-design.mdのイベント制御表を参照し、未カバーのイベントに対応するUCを `usecase-lister-prompt.md`（mode: fix）で追加する
・各サブエージェントの出力を"fix補完エージェントの出力(Step Fix):"として記載する
・fix結果のユーザー確認結果を記載する
　fix結果ユーザー確認(Step Fix):

### 完了条件
fix対象の観点について補完が完了し、ユーザーの確認が得られている

### 状態判定
完了条件を満たしたら、呼び出し元に制御を戻す（後続フェーズへの前進遷移・後処理・コミットは行わない）
```

---

### 4. Integration セクションへの fixモード入力定義追加

#### 変更理由

fixモードの入力パラメータを Integration セクションに明記する。

#### before

```markdown
**Input from caller:**
- `feature_name`: プロジェクト名
```

#### after

```markdown
**Input from caller:**
- `feature_name`: プロジェクト名
- `mode`:（オプション）`phase6`（通常、デフォルト）/ `fix`（QAゲート差し戻し）
- `fix_target`:（fixモード時のみ）不足と判定された観点の説明
- `qa_feedback`:（fixモード時のみ）QAエージェントからのフィードバック全文
```

---

## REQ-C-007: object-design-qa-agent のレビュー方式変更（fs-design-phase8-object）

### 変更対象ファイル

- `skills/fs-design-phase8-object/SKILL.md` — **編集済み**
- `skills/fs-design-phase8-object/object-designer-prompt.md` — 未編集（mode 追加が必要）

---

### 1. Step 構成の固定レイヤー順から動的構成への変更

#### 変更理由

従来の固定5サブフェーズ（domain→app→infra→pres→summary）構成では、レイヤー構成がプロジェクトによって異なる場合に対応できない。layered-architecture.md からレイヤーリストを動的に取得し、依存先→依存元の順に設計順序を決定する方式に変更する。また、各レイヤー設計の直後にQAレビューを挿入することで早期品質確保を実現する。

#### before

```
Step1: domain
Step2: app（固定: アプリケーション層）
Step3: infra（固定: インフラ層）
Step4: pres（固定: プレゼンテーション層）
Step5: summary
Step6: 品質基準確認（object-design 共通スキル）
Step7: QA review（ゲート3: object-design-qa-agent — 全レイヤー一括レビュー）
Step8: fix（REJECTED時）
後処理
```

- Step2〜4 は固定レイヤー名でハードコードされていた
- QAレビューは Step7 で全レイヤーを一括横断レビューする方式
- 個別レイヤーの品質問題が全レイヤー設計完了後まで検出されなかった

#### after

```
Step1: domain（ドメイン層設計 — domain-layer-object-designer-prompt.md 使用）
Step2: 非ドメイン層の設計順序決定（layered-architecture.md から動的に取得）
Step 3〜(2+2N): 各レイヤーの設計＋レビュー（動的 Step）
  - 奇数番 Step: レイヤー設計（object-designer-prompt.md 使用）
  - 偶数番 Step: レイヤーレビュー（design-qa-dispatch 経由で object-design-qa-agent を review_scope 付きで呼び出し）
  - REJECTED → object-designer-prompt.md（mode: fix）で修正 → 再レビュー
Step (3+2N): summary（オブジェクト設計概要）
Step (4+2N): 品質基準確認（object-design 共通スキル）
Step (5+2N): 全体整合性QAレビュー（gate3: レイヤー間整合性のみ）
Step (6+2N): 全体整合性 QA REJECTED 修正ループ
後処理
```

- Step2 で layered-architecture.md からレイヤーリストを動的取得
- 各レイヤーに「設計 Step」＋「レビュー Step」のペアを動的に繰り返す
- レビュー REJECTED → fix モードで再設計 → 再レビューのループ構造
- 全体整合性レビュー（Step (5+2N)）はレイヤー間整合性確認に限定

#### 適用状況
- `skills/fs-design-phase8-object/SKILL.md`: **編集済み**

---

### 2. 個別レイヤーレビューの呼び出し方式

#### 変更理由

各レイヤー設計直後に object-design-qa-agent を個別モード（当該レイヤーのみ）で呼び出すことで、早期品質確保を実現する。design-qa-dispatch に review_scope パラメータを渡してレビュー範囲を限定する。

#### before

（個別レイヤーレビュー Step は存在しない。Step7 で全レイヤー一括レビューのみ）

#### after

各レイヤーのレビュー Step テンプレート（偶数番 Step）:

```markdown
### 各レイヤーのレビュー Step テンプレート

#### 成果物
fs-design-phase8-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・design-qa-dispatch (aide-powers skill)を activate して実行し（mode: design-workflow、target_reviewer: object-design-qa-agent、review_scope: {レイヤー名}層のみ（object-design-{layer-name}.md 単体レビュー））、出力を"object-design-qa-agent({レイヤー名}層)の出力(Step N):"として記載する
　{レイヤー名}層レビュー観点(Step N): {このレイヤーをどの責務（アプリケーション層相当/インフラ層相当/プレゼンテーション層相当/複合等）の観点でレビューしたかの一覧}
　{レイヤー名}層レビュー結果(Step N):（APPROVED / REJECTED）

#### 状態判定
- APPROVED の場合: 次のレイヤーの設計 Step へ遷移する（全レイヤー完了時は summary Step へ遷移する）
- REJECTED の場合: QA指摘内容を確認し、当該レイヤーの設計を `object-designer-prompt.md`（mode: fix。QA指摘内容と修正対象ファイルを渡す）で修正する。修正後、ユーザー合意を得てから当該レイヤーのレビュー Step を再実行する（APPROVED になるまで繰り返す。最大3回で収束しない場合はユーザーに報告）
```

#### 適用状況
- `skills/fs-design-phase8-object/SKILL.md`: **編集済み**

---

### 3. 全体整合性レビューの検証項目限定

#### 変更理由

個別レイヤーレビューで各層の品質が担保済みであることを前提とし、全体整合性レビュー（旧ゲート3相当）をレイヤー間の整合性確認に限定する。

#### before

```markdown
## Step7: QA review（ゲート3: object-design-qa-agent）
- design-qa-dispatch 経由で object-design-qa-agent を呼び出す
- 全レイヤー（object-design-domain/app/infra/pres.md + ubiquitous-language.md）を一括レビュー
- 検証項目 A〜I の全てを実行
```

#### after

```markdown
## Step (5+2N): 全体整合性QAレビュー（gate3: object-design-qa-agent）

・design-qa-dispatch (aide-powers skill)を activate して実行し（mode: design-workflow、target_reviewer: object-design-qa-agent、review_scope: 全体整合性レビュー（全レイヤー横断）。レイヤー間の整合性確認に限定する）

全体整合性レビューの検証項目（個別レイヤーレビューで検証済みの項目は除外し、横断的な整合性のみ検証）:

| カテゴリ | 検証内容 |
|---|---|
| B | レイヤー間依存違反チェック（全レイヤー横断） |
| E | ユビキタス言語の整合性チェック（全レイヤー横断） |
| — | レイヤー間インターフェースの整合性（引数型・戻り値型の一致） |
```

#### 適用状況
- `skills/fs-design-phase8-object/SKILL.md`: **編集済み**

---

### 4. プロンプトテンプレートのリネームと mode 変更

#### 変更理由

`ddd-modeler-prompt.md` は実質的にドメイン層オブジェクト設計専用プロンプトであるため、`domain-layer-object-designer-prompt.md` にリネームした。また、非ドメイン層の各レイヤー設計に `object-designer-prompt.md` を使用するが、固定モード（phase8_app/phase8_infra/phase8_pres）を廃止し、動的レイヤー名で呼び出す方式に変更する。サブエージェントは layered-architecture.md のレイヤー定義を読み込み、対象レイヤーの責務に応じて処理手順・成果物構成を自分で判断する。

#### before

```markdown
## 実行モード

{mode}

※ mode は以下のいずれか:
- `phase8_app` — アプリケーション層の新規設計
- `phase8_infra` — インフラ層の新規設計
- `phase8_pres` — プレゼンテーション層の新規設計
- `phase8_summary` — オブジェクト設計概要の作成
- `fix` — QA指摘に基づく非ドメイン層の修正
```

（以下、mode: phase8_app / phase8_infra / phase8_pres ごとに固定の「前フェーズの成果物」「処理手順」「成果物の構成」セクションがハードコードされている）

#### after

```markdown
## 実行モード

{mode}

※ mode は以下のいずれか:
- `phase8_{layer-name}` — 指定レイヤーのオブジェクト設計（レイヤー名は layered-architecture.md から動的に決定される）
- `phase8_summary` — オブジェクト設計概要の作成
- `fix` — QA指摘に基づく非ドメイン層の修正

## 対象レイヤー情報（phase8_{layer-name} モード時に渡される）

- layer_name: {レイヤー名}（layered-architecture.md に定義されたレイヤー名）
- layer_definition: {レイヤーの責務定義}（layered-architecture.md から抽出）
- output_file: {出力ファイルパス}（.aide/specs/{feature_name}/object-design-{layer-name}.md）
- dependencies: {このレイヤーが依存する他レイヤーの設計書パスリスト}
```

（以下、固定の phase8_app / phase8_infra / phase8_pres セクションを削除し、汎用的な処理手順に置き換える）

```markdown
## mode: phase8_{layer-name}（指定レイヤーのオブジェクト設計）

### 前フェーズの成果物

以下のファイルを Read で読み込むこと:

- `.aide/specs/{feature_name}/layered-architecture.md` — レイヤー構成・責務定義・依存ルールの把握
- `.aide/specs/{feature_name}/user-requirements.md`
- `.aide/specs/{feature_name}/system-requirements.md`
- `.aide/specs/{feature_name}/object-design-domain.md`
- `.aide/specs/{feature_name}/ubiquitous-language.md`
- `.aide/specs/{feature_name}/gui-design.md`（プレゼンテーション層相当の場合）
- `.aide/specs/{feature_name}/usecases/` 配下（アプリケーション層相当の場合）
- 依存先レイヤーの設計書（dependencies で渡されたファイル）

### 処理手順

1. `layered-architecture.md` から対象レイヤー（{layer_name}）の責務定義・依存ルールを読み込む
2. 対象レイヤーの責務に応じて、設計すべきクラス群を判断する:
   - アプリケーション層相当（ユースケース実行、DTO変換、DI組み立て）→ ユースケースクラス、DTO、例外クラス、DI方針、設定クラスを設計
   - インフラ層相当（外部リソースアクセス、リポジトリ実装）→ リポジトリ具象クラス、外部アダプタ、テスト用ダミー実装、データマッピングを設計
   - プレゼンテーション層相当（UI制御、画面遷移、イベントハンドリング）→ 画面クラス、UIイベント対応、ダイアログ、スレッド管理、エントリーポイントを設計
   - その他のレイヤー → layered-architecture.md の責務定義に従い、適切なクラス設計を判断する
3. 各クラスについて共通要件（役割、パブリックメソッド、パブリックプロパティ、依存関係）を定義する
4. SOLID原則・テスタビリティの確保を適用する
5. `{output_file}` に成果物を Write で作成する
6. ユーザーに提示し合意を得る

### レイヤー責務の判断基準

サブエージェントは layered-architecture.md のレイヤー定義から以下を読み取り、自律的に設計内容を判断する:
- レイヤーの責務（何をするレイヤーか）
- 依存先（どのレイヤーに依存するか）
- 依存元（どのレイヤーから依存されるか）
- レイヤー間のインターフェース（依存性逆転の適用箇所）

**複数責務を持つレイヤーの場合:**
- 1つのレイヤーが複数の従来モード相当の役割を兼ねる場合がある（例: アプリケーション層がインフラ層の役割も持つ、プレゼンテーション層がアプリケーション層の役割も持つ等）
- その場合、全ての責務に対応する設計を漏れなく実施すること（一方の責務だけ設計して他を省略してはならない）
- layered-architecture.md のレイヤー責務定義に記載された全ての役割について、対応するクラス群を設計する
- 判断に迷う場合は layered-architecture.md の責務定義を根拠に網羅性を確保する
```

#### 適用状況
- `ddd-modeler-prompt.md` → `domain-layer-object-designer-prompt.md`: **リネーム済み**
- `object-designer-prompt.md`: **未対応**（固定モード→動的レイヤー対応への書き換えが必要）

#### 適用状況
- `ddd-modeler-prompt.md` → `domain-layer-object-designer-prompt.md`: **リネーム済み**
- `object-designer-prompt.md`: 既存。各レイヤー用の mode（`phase8_{layer-name}`）は動的に決定される設計のため、プロンプト内に mode 判定ロジックが必要。未確認（SKILL.md の記述上は mode: phase8_{layer-name} で呼び出す前提になっている）

---

### 5. Integration セクションの更新

#### 変更理由

Step 構成の変更に伴い、design-qa-dispatch の呼び出しパターンと呼び出し箇所が変わったため Integration セクションを更新する。

#### before

```markdown
**呼び出すQAレビューアー（design-qa-dispatch 経由）:**
- `object-design-qa-agent (aide-powers agent)` — Step 7 / Step 8（gate3）
```

#### after

```markdown
**呼び出すQAレビューアー（design-qa-dispatch 経由）:**
- `object-design-qa-agent (aide-powers agent)` — 各レイヤーレビュー Step（個別レイヤーレビュー）/ Step (5+2N)（全体整合性レビュー）/ Step (6+2N)（修正後再レビュー）
```

#### 適用状況
- `skills/fs-design-phase8-object/SKILL.md`: **編集済み**

---

## REQ-C-008: ユースケース分析の粒度細分化

### 変更対象ファイル

- `skills/fs-design-phase6-usecase/SKILL.md`
- `skills/fs-design-phase6-usecase/usecase-lister-prompt.md`
- `skills/fs-design-phase6-usecase/usecase-coverage-reviewer-prompt.md`（**新規作成**）

---

### 1. usecase-lister-prompt.md への粒度基準変更指示

#### 変更理由

UCリストアップサブエージェントへの指示として、粒度基準を「全操作網羅」レベルに明確化する。

#### before

（usecase-lister-prompt.md の粒度基準に関する明示的な定義なし — サブエージェントの裁量で粒度を決定）

#### after

usecase-lister-prompt.md に以下の粒度基準セクションを追加する:

```markdown
## 粒度基準

ユースケースの粒度は以下の基準に従うこと:

### 必須粒度レベル
- 各ユースケースは「ユーザーが画面上で行う1つの操作とそれに対するシステムの応答」の粒度で記述する
- 抽象的な機能名（例: 「ファイル管理」「設定変更」）ではなく、具体的な操作フロー（例: 「ファイル選択ダイアログを開く」「設定値を入力して保存ボタンを押す」）として記述する
- ボタンクリック、メニュー選択、ダイアログ操作、キーボードショートカット、ドラッグ&ドロップ等、ユーザーが実行可能な全操作をユースケースとして網羅する

### 網羅性の確認方法
- gui-design.md が存在する場合: イベント制御表の全行（全画面 × 全コンポーネント × 全操作イベント）に対応するユースケースが存在することを確認する
- gui-design.md が存在しない場合: user-requirements.md の全要件に対応する操作がユースケースとしてカバーされていることを確認する
- 未カバーの操作を検出した場合、ユースケースを追加して網羅性を確保する
```

---

### 2. usecase-coverage-reviewer-prompt.md の新規作成

#### 変更理由

ユースケース網羅性レビューをオーケストレータ自身が行うのではなく、専用プロンプトテンプレートを用意してサブエージェントに委譲する。全画面・全機能・全操作に対するユースケースの考慮漏れを検出するレビュー機能を独立した Step として実行する。

#### before

（プロンプトテンプレートは存在しない。網羅性チェックの仕組み自体がない）

#### after

`skills/fs-design-phase6-usecase/usecase-coverage-reviewer-prompt.md` を新規作成する:

```markdown
# ユースケース網羅性レビュー プロンプトテンプレート

## 実行モード

{mode}

※ mode は以下のいずれか:
- `review` — UCリスト完成後の網羅性レビュー

---

## あなたの役割

あなたは「ユースケース網羅性レビューアー」です。ユースケースリスト（usecase-list.md）が、全画面・全機能・全操作を網羅しているかを検証することに特化しています。

## feature_name

{feature_name}

## 入力ファイル

以下のファイルを全て読み込むこと:
- `.aide/specs/{feature_name}/usecases/usecase-list.md` — レビュー対象
- `.aide/specs/{feature_name}/gui-design.md` — GUI設計書（存在する場合）
- `.aide/specs/{feature_name}/user-requirements.md` — ユーザー要件定義

## レビュープロセス

### 1. 操作イベント一覧の作成

**GUI有りプロジェクト（gui-design.md が存在する場合）:**
- gui-design.md のイベント制御表から全行を抽出する
- 全画面 × 全コンポーネント × 全操作イベントのリストを作成する
- 画面遷移フローの全遷移トリガーもリストに含める
- 状態遷移図の全遷移トリガーもリストに含める

**GUI無しプロジェクト（gui-design.md が存在しない場合）:**
- user-requirements.md の全要件から、ユーザーが実行可能な操作を抽出する
- 各要件の実現に必要な操作フロー（入力→処理→出力）をリスト化する

### 2. ユースケースとの照合

- 操作イベント一覧の各項目について、対応するユースケースが usecase-list.md に存在するか1つずつ確認する
- 照合基準:
  - 操作イベントの「処理内容」がユースケースの主操作または代替フローとして記述されているか
  - 1つの操作イベントが複数のユースケースにまたがっていてもよい（カバーされていればOK）
  - 1つのユースケースが複数の操作イベントをカバーしていてもよい（粒度が適切であればOK）

### 3. 未カバー操作の検出と報告

- 対応するユースケースが見つからない操作イベントを「未カバー操作」として報告する
- 各未カバー操作について、追加すべきユースケースの候補名を提案する

## 出力フォーマット

```markdown
## UC網羅性レビュー結果

### 照合サマリ
- 操作イベント総数: {N}件
- カバー済み: {N}件
- 未カバー: {N}件

### 未カバー操作一覧（未カバーがある場合のみ）
| # | 画面名 | コンポーネント名 | イベント種別 | 処理内容 | 追加UC候補名 |
|---|---|---|---|---|---|
| 1 | {画面} | {コンポーネント} | {イベント} | {処理} | {提案するUC名} |

### 判定
- 結果: 全操作カバー済み / 未カバー操作あり（{N}件）
```

## 報告フォーマット
完了時に以下を報告すること:
- **Status:** DONE
- 判定結果（全操作カバー済み / 未カバー操作あり）
- 未カバー件数（0件の場合も明記）
```

---

### 3. fs-design-phase6-usecase SKILL.md に「UC網羅性レビュー Step」を追加

#### 変更理由

Step 2（UCリストアップ）完了後に、サブエージェントによる網羅性レビューを独立した Step として実行する。オーケストレータ自身が網羅性チェックを行うのではなく、`usecase-coverage-reviewer-prompt.md` を使用したサブエージェントに委譲する。

#### before

（Step 2 完了後は Step 3（UC実現プロセス分析）に直接遷移する。網羅性チェック Step は存在しない）

#### after

Step 2 と Step 3（UC実現プロセス分析）の間に新 Step を挿入する（以降の Step 番号を繰り下げ）:

```markdown
## Step 3: UC網羅性レビュー（サブエージェント実行）

### 成果物
fs-design-phase6-usecase-report.txt

以下を満たすこと
・現在のPhase:
・現在のStep:
・本スキルディレクトリの `usecase-coverage-reviewer-prompt.md`（mode: review）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"UC網羅性レビューエージェントの出力(Step3):"として記載する
　網羅性レビュー結果(Step3): {全操作カバー済み / 未カバー操作あり（N件）}
　未カバー操作一覧(Step3): {未カバーの場合のみ記載}

### 完了条件
fs-design-phase6-usecase-report.txtに"UC網羅性レビューエージェントの出力(Step3):"が記載され、網羅性レビュー結果(Step3)が「全操作カバー済み」である

### 状態判定
- 「全操作カバー済み」の場合: 次の Step（UC実現プロセス分析）へ遷移する
- 「未カバー操作あり」の場合: 未カバー操作一覧をユーザーに報告し、`usecase-lister-prompt.md`（mode: fix）で不足UCを追加するサブエージェントを実行する。追加後、本 Step（UC網羅性レビュー）を再実行する（全操作カバー済みになるまで繰り返す）
```

---

### 4. Step 2 の完了条件の変更（網羅性チェックの削除）

#### 変更理由

網羅性チェックを独立した Step 3（サブエージェント実行）に分離したため、Step 2 の完了条件からオーケストレータによる網羅性チェックを削除する。

#### before（差分設計の前回版）

```markdown
### 完了条件
（略）...し、網羅性チェック結果(Step2)が「全操作カバー済み」である
```

#### after

```markdown
### 完了条件
fs-design-phase6-usecase-report.txtの"UCリストアップエージェントの出力(Step2):"の内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、UCリストのユーザー合意結果(Step2)が「合意」であり、`.aide/specs/{feature_name}/usecases/usecase-list.md` がファイルサイズ1byte以上で存在する
```

（網羅性チェックは Step 3 で実施するため、Step 2 の完了条件からは除外する）

---

### 5. Integration セクションへのプロンプトテンプレート追加

#### 変更理由

新規プロンプトテンプレートを Integration セクションに追記する。

#### before

```markdown
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `usecase-lister-prompt.md` — Step 2（mode: phase6_list / fix）
- `usecase-process-analyzer-prompt.md` — Step 3〜（mode: phase6_process / fix）
```

#### after

```markdown
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `usecase-lister-prompt.md` — Step 2（mode: phase6_list / fix）
- `usecase-coverage-reviewer-prompt.md` — Step 3（mode: review）【新規作成】
- `usecase-process-analyzer-prompt.md` — Step 4〜（mode: phase6_process / fix）（旧 Step 3〜。番号繰り下げ）
```
