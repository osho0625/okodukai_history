# 差分設計書

## 設計方針
- 既存ファイルへのセクション追加 + 新規ファイル追加で対応（OCP準拠: 既存の正常動作構造を壊さない）
- サブエージェントプロンプト末尾に「## 報告フォーマット」セクションを追加し、SKILL.md側の状態判定が前提とするステータスを明文化する
- SKILL.md Step2 完了条件からユーザー合意要件を削除（Step4で承認する設計のため）
- SKILL.md Step2/Step5 に FAIL 分岐を追加
- SKILL.md Step3 にサブエージェント出力→レポート転記の対応関係を明示
- SKILL.md Step5 にプログラム実現不可UC検出時のサブフロー（ユーザー報告→承認→UC削除）を追加
- usecase-removal-prompt.md を新規作成

---

## 修正対象の差分設計

### 変更対象1: SKILL.md — Step2 完了条件の修正

#### before
```markdown
### 完了条件
fs-design-phase6-usecase-report.txtの"UCリストアップエージェントの出力(Step2):"の
内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、UCリストのユーザー合意結果(Step2)が「合意」であり、`.aide/specs/{feature_name}/usecases/usecase-list.md` がファイルサイズ1byte以上で存在する
```

#### after
```markdown
### 完了条件
fs-design-phase6-usecase-report.txtの"UCリストアップエージェントの出力(Step2):"の
内容を確認し、ステータスが DONE / DONE_WITH_CONCERNS であり、`.aide/specs/{feature_name}/usecases/usecase-list.md` がファイルサイズ1byte以上で存在する
```

#### 変更理由
ユーザー承認はStep4で実施する設計であり、Step2の完了条件にユーザー合意を含めるとStep2とStep4で二重にユーザー承認を要求する矛盾が生じる。Step2はサブエージェントによるUCリスト作成の完了のみを条件とすべき。

---

### 変更対象2: SKILL.md — Step2 成果物セクションの修正（ユーザー合意項目の削除）

#### before
```markdown
・サブエージェントがユーザーと直接対話して得たUCリストの合意結果を、次の項目で記載する
　UCリストのユーザー合意結果(Step2):
```

#### after
```markdown
```
（上記2行を削除。ユーザー合意はStep4の責務であり、Step2の成果物としてのユーザー合意結果記載は不要）

#### 変更理由
Step2完了条件およびStep2状態判定からユーザー合意を削除する設計変更に伴い、成果物セクション内の「UCリストのユーザー合意結果(Step2):」項目も整合性のために削除する必要がある。この項目が残存するとオーケストレータが存在しない合意結果を記載しようとする不整合が生じる。

---

### 変更対象3: SKILL.md — Step2 状態判定への FAIL 分岐追加

#### before
```markdown
### 状態判定
完了条件を満たしていればStep3へ遷移する。ただし以下の条件で分岐する:
- ステータスが DONE_WITH_CONCERNS の場合 → Step3 へ遷移する前に懸念事項をユーザー
に報告し対応方針を確認する
- ユーザー合意が得られていない場合 → 合意が得られるまで Step2 内で対話を継続する
- ステータスが NEEDS_CONTEXT の場合 → 不足情報を補い `usecase-lister-prompt.md` 
のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- ステータスが BLOCKED の場合 → ユーザーに報告し対応方針を確認する
```

#### after
```markdown
### 状態判定
完了条件を満たしていればStep3へ遷移する。ただし以下の条件で分岐する:
- ステータスが DONE_WITH_CONCERNS の場合 → Step3 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- ステータスが NEEDS_CONTEXT の場合 → 不足情報を補い `usecase-lister-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- ステータスが BLOCKED の場合 → ユーザーに報告し対応方針を確認する
- ステータスが FAIL の場合 → UCリスト作成に回復不能なエラーが発生している。エラー内容をユーザーに報告し、対応方針（再実行 / 入力情報の修正 / 前フェーズへの差し戻し）を確認する
```

#### 変更理由
- FAIL ステータスの分岐が未定義だったため、サブエージェントが回復不能エラーを報告した場合にオーケストレータの動作が未定義となっていた
- 併せて「ユーザー合意が得られていない場合」の分岐を削除（ユーザー合意はStep4の責務であるため）

---

### 変更対象4: SKILL.md — Step3 成果物のサブエージェント出力転記参照箇所明示

#### before
```markdown
・本スキルディレクトリの `usecase-coverage-reviewer-prompt.md`（mode: review）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"UC網羅性レビューエージェントの出力(Step3):"として記載する。サブエージェントは照合用の中間リスト（func-list.md, gui-page-list.md, usecase-gui-list.md, usecase-process-list.md, usecase-buginform-list.md, usecase-update-list.md, usecase-reset-error.md, usecase-params-error.md, usecase-cancel-error.md）を `.aide/specs/{feature_name}/usecases/` 配下に作成し、usecase-list.md との照合を行う
　網羅性レビュー結果(Step3): {全操作カバー済み / 未カバー操作あり（N件）}
　未カバー操作一覧(Step3): {未カバーの場合のみ記載}
```

#### after
```markdown
・本スキルディレクトリの `usecase-coverage-reviewer-prompt.md`（mode: review）のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを実行し、サブエージェントの出力を"UC網羅性レビューエージェントの出力(Step3):"として記載する。サブエージェントは照合用の中間リスト（func-list.md, gui-page-list.md, usecase-gui-list.md, usecase-process-list.md, usecase-buginform-list.md, usecase-update-list.md, usecase-reset-error.md, usecase-params-error.md, usecase-cancel-error.md）を `.aide/specs/{feature_name}/usecases/` 配下に作成し、usecase-list.md との照合を行う
・サブエージェント出力の「### 判定」セクション内「結果:」行の値を以下の項目に転記する（文字列は「全操作カバー済み」または「未カバー操作あり（{N}件）」のいずれか）:
　網羅性レビュー結果(Step3): {サブエージェント出力「### 判定」→「結果:」行の値}
・サブエージェント出力の「### 未カバーユースケース一覧」テーブル内容を以下に転記する:
　未カバー操作一覧(Step3): {サブエージェント出力「### 未カバーユースケース一覧」の内容。未カバー0件の場合は「なし」}
```

#### 変更理由
サブエージェント（usecase-coverage-reviewer）の出力フォーマットのどの部分をレポートのどの項目に転記するかが明示されていなかったため、オーケストレータがサブエージェント出力の解釈を曖昧に行うリスクがあった。転記元（出力フォーマットのセクション名・行名）を明示することで、連携の確実性を向上させる。

---

### 変更対象5: SKILL.md — Step5 状態判定への FAIL 分岐追加とプログラム実現不可UCサブフロー追加

#### before
```markdown
### 状態判定
完了条件を満たしていればStep6へ遷移する。ただし以下の条件で分岐する:
- ステータスが DONE_WITH_CONCERNS のUCがある場合 → Step6 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- ステータスが NEEDS_CONTEXT のUCがある場合 → 不足情報を補い当該UCについて `usecase-process-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- ステータスが BLOCKED のUCがある場合 → ユーザーに報告し対応方針を確認する
```

#### after
```markdown
### 状態判定
完了条件を満たしていればStep6へ遷移する。ただし以下の条件で分岐する:
- ステータスが DONE_WITH_CONCERNS のUCがあり、かつ「プログラム実現不可UC」が報告されている場合 → 以下のサブフローを実行する:
  1. サブエージェント出力から「プログラム実現不可UC一覧」（UC-ID、ユースケース名、不可理由）を抽出する
  2. 該当UC一覧と不可理由をユーザーに提示し、UCリストからの削除承認を求める（番号付き選択肢: 1. 全て削除を承認 / 2. 一部のみ削除（対象を指定）/ 3. 削除しない（現状維持）/ 4. その他（自由記述））
  3. ユーザーが削除を承認した場合 → `usecase-removal-prompt.md` のプレースホルダーを削除対象UC情報で置き替えたデータをプロンプトとし、サブエージェントを実行する。サブエージェントの出力を"UC削除エージェントの出力(Step5):"としてレポートに記載する
  4. 削除完了後、残りの DONE_WITH_CONCERNS 懸念事項（プログラム実現不可以外）があればユーザーに報告し対応方針を確認する。その後 Step6 へ遷移する
- ステータスが DONE_WITH_CONCERNS のUCがあり、「プログラム実現不可UC」が含まれない場合 → Step6 へ遷移する前に懸念事項をユーザーに報告し対応方針を確認する
- ステータスが NEEDS_CONTEXT のUCがある場合 → 不足情報を補い当該UCについて `usecase-process-analyzer-prompt.md` のプレースホルダーを実データで置き替えたデータをプロンプトとし、サブエージェントを再実行する
- ステータスが BLOCKED のUCがある場合 → ユーザーに報告し対応方針を確認する
- ステータスが FAIL のUCがある場合 → 実現プロセス分析に回復不能なエラーが発生している。エラー内容と該当UC-IDをユーザーに報告し、対応方針（当該UCのみ再実行 / 入力情報の修正 / スキップして次Stepへ進む）を確認する
```

#### 変更理由
- FAIL ステータスの分岐が未定義だったため追加
- プログラム実現不可UCが検出された場合のフロー（ユーザー報告→承認→削除）が未定義だったため追加。usecase-process-analyzer-prompt.md が DONE_WITH_CONCERNS でプログラム実現不可UCを報告する設計に対応し、オーケストレータ側で削除サブエージェント（usecase-removal-prompt.md）を起動する手順を規定した

---

### 変更対象6: usecase-lister-prompt.md — 報告フォーマットセクション追加

#### before
```markdown
## 注意事項

- GUI設計やシステム構成設計はUCの粒度決定や操作手順記述のためには使わない。ただし gui-design.md は「操作漏れ確認」として参照してよい（上記「gui-design.md による操作漏れ確認」セクション参照）
- ユーザーにヒアリングしてから決定する。AIが勝手にUCを決めない
- 質問は1つずつ投げる（一度に複数の質問をしない）
- fix モードの場合は、既存の usecase-list.md を Read で読み込み、指摘内容に基づいて修正する
```
（ファイル末尾）

#### after
```markdown
## 注意事項

- GUI設計やシステム構成設計はUCの粒度決定や操作手順記述のためには使わない。ただし gui-design.md は「操作漏れ確認」として参照してよい（上記「gui-design.md による操作漏れ確認」セクション参照）
- ユーザーにヒアリングしてから決定する。AIが勝手にUCを決めない
- 質問は1つずつ投げる（一度に複数の質問をしない）
- fix モードの場合は、既存の usecase-list.md を Read で読み込み、指摘内容に基づいて修正する

---

## 報告フォーマット

完了時に以下を報告すること:

- **Status:** {以下のいずれか}
  - `DONE` — UCリストの作成が正常に完了した（ユーザーとの対話によるUC確定を含む）
  - `DONE_WITH_CONCERNS` — UCリストの作成は完了したが、懸念事項がある（例: 要件の解釈に曖昧さが残る、一部のUCの粒度に自信がない等）。懸念事項の内容を併記すること
  - `NEEDS_CONTEXT` — UCリスト作成に必要な情報が不足している。不足情報の具体的な内容（どのファイルが必要か、どの質問への回答が必要か）を併記すること
  - `BLOCKED` — 外部要因により作業を継続できない（例: 前フェーズの成果物が存在しない、入力ファイルが破損している等）。ブロック要因を併記すること
  - `FAIL` — 回復不能なエラーが発生した（例: 入力ファイルの構造が想定と全く異なり解釈不能、矛盾する要件により合理的なUCリストが作成できない等）。エラー内容と試みた対処を併記すること
- 作成したUCの総数
- 利用者の分類数
- 懸念事項（DONE_WITH_CONCERNS の場合）
```
（ファイル末尾）

#### 変更理由
SKILL.md Step2 の状態判定が DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED の各ステータスを前提としているが、usecase-lister-prompt.md にこれらのステータスを返却する形式の定義がなく、サブエージェントが不定形の出力を返すリスクがあった。報告フォーマットの明示により、サブエージェントとオーケストレータ間のインターフェースを確定する。

---

### 変更対象7: usecase-process-analyzer-prompt.md — 報告フォーマットセクションとプログラム実現不可UC判定基準セクション追加

#### before
```markdown
## fix モードの場合

- 既存の usecase-{uc名}.md を Read で読み込む
- 改善提案内容に基づいて、基本フロー・代替フロー等を更新する
- 更新箇所には `<!-- 改善反映: {改善内容の要約} -->` コメントを付ける
- 既存の構造を維持し、変更が必要な部分のみを Edit で修正する
```
（ファイル末尾）

#### after
```markdown
## fix モードの場合

- 既存の usecase-{uc名}.md を Read で読み込む
- 改善提案内容に基づいて、基本フロー・代替フロー等を更新する
- 更新箇所には `<!-- 改善反映: {改善内容の要約} -->` コメントを付ける
- 既存の構造を維持し、変更が必要な部分のみを Edit で修正する

---

## プログラム実現不可UCの判定基準

実現プロセスを分析する過程で、以下のカテゴリに該当するユースケースを「プログラム単体では実現不可能」と判定する:

| カテゴリ | 説明 | 例 |
|---|---|---|
| 物理的操作 | プログラムでは代替できない物理世界の操作が必須 | 書類への押印、物品の配送、機器の物理ボタン操作 |
| 人間の介在必須 | 法令・規則・業務ルールにより人間の判断・承認が省略不可 | 法的署名、医師の最終診断、人事考課の最終決定 |
| 外部ハードウェア制御 | 対象システムのスコープ外のハードウェア直接制御が必要 | 専用センサーのキャリブレーション、物理鍵の施解錠 |
| 法的手続き | 法的機関への届出・申請等プログラムでは完結しない手続き | 登記申請、裁判所への書面提出、公証人の認証 |
| 対面コミュニケーション | プログラムでは代替できない対面の相互作用が必須 | 面接の実施、実技試験の評価、対面での身元確認 |

### 判定時の注意事項
- **APIやWeb連携で代替可能な操作は「実現不可」としない**（例: メール送信、外部API呼び出し、クラウドサービス連携）
- **UI操作で代替可能な操作は「実現不可」としない**（例: ファイル選択ダイアログ、ドラッグ&ドロップ）
- 判定に迷う場合は「実現不可」としない（ユーザーに判断を委ねる方向で報告する）

---

## 報告フォーマット

完了時に以下を報告すること:

- **Status:** {以下のいずれか}
  - `DONE` — 対象UCの実現プロセス分析が正常に完了した
  - `DONE_WITH_CONCERNS` — 実現プロセス分析は完了したが、懸念事項がある。以下のいずれかの場合に使用する:
    - プログラム実現不可UCを検出した場合（下記「プログラム実現不可UC報告」を必ず併記）
    - 実現プロセスの記述に不確実性がある場合（懸念内容を併記）
  - `NEEDS_CONTEXT` — 分析に必要な情報が不足している。不足情報の具体的な内容を併記すること
  - `BLOCKED` — 外部要因により作業を継続できない。ブロック要因を併記すること
  - `FAIL` — 回復不能なエラーが発生した（例: UC定義が根本的に破綻しており実現プロセスが論理的に構築不可能等）。エラー内容と試みた対処を併記すること
- 作成/更新した usecase-{uc名}.md のファイル名
- 懸念事項（DONE_WITH_CONCERNS の場合）

### プログラム実現不可UC報告（DONE_WITH_CONCERNS かつ該当UCありの場合）

プログラム実現不可と判定したUCがある場合、以下の形式で必ず報告に含めること:

```markdown
### プログラム実現不可UC一覧
| UC-ID | ユースケース名 | 不可カテゴリ | 理由 |
|---|---|---|---|
| {UC-ID} | {ユースケース名} | {カテゴリ名} | {具体的な不可理由} |
```
```
（ファイル末尾）

#### 変更理由
- SKILL.md Step5 の状態判定が各ステータスを前提としているが、プロンプト側に報告フォーマットが未定義だった
- プログラムでは実現不可能なUCへの対応方針が未定義のため、判定基準と報告形式を追加。DONE_WITH_CONCERNS ステータスで報告する形式にすることで、SKILL.md Step5側のサブフロー（ユーザー報告→承認→削除）と連携する

---

### 変更対象8: usecase-coverage-reviewer-prompt.md — 報告フォーマットセクションの拡充

#### before
```markdown
## 報告フォーマット

完了時に以下を報告すること:
- **Status:** DONE
- 判定結果（全操作カバー済み / 未カバー操作あり）
- 未カバー件数（0件の場合も明記）
```
（ファイル末尾）

#### after
```markdown
## 報告フォーマット

完了時に以下を報告すること:

- **Status:** {以下のいずれか}
  - `DONE` — 網羅性レビューが正常に完了した
  - `DONE_WITH_CONCERNS` — レビューは完了したが、懸念事項がある（例: 一部の要件の解釈に曖昧さがありカバー判定に自信がない等）。懸念事項の内容を併記すること
  - `NEEDS_CONTEXT` — レビューに必要な情報が不足している（例: gui-design.md が存在しないがGUI有りプロジェクトと思われる等）。不足情報の具体的な内容を併記すること
  - `BLOCKED` — 外部要因により作業を継続できない（例: usecase-list.md が存在しない、入力ファイルが破損している等）。ブロック要因を併記すること
  - `FAIL` — 回復不能なエラーが発生した（例: 入力ファイルの構造が想定と全く異なり照合プロセスが実行不能等）。エラー内容と試みた対処を併記すること
- 判定結果: 「全操作カバー済み」または「未カバー操作あり（{N}件）」（出力フォーマット「### 判定」セクションの「結果:」行と同一の文字列）
- 未カバー件数（0件の場合も明記）
- 懸念事項（DONE_WITH_CONCERNS の場合）

**重要:** 「### 判定」セクションの「結果:」行に記載する値は、必ず「全操作カバー済み」または「未カバー操作あり（{N}件）」のいずれかとすること（SKILL.md Step3 の状態判定条件と文字列レベルで一致させる必要があるため）。
```
（ファイル末尾）

#### 変更理由
- 既存の報告フォーマットでは DONE のみが定義されており、DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED / FAIL の定義がなかった。SKILL.md Step3 の状態判定は現状「全操作カバー済み」「未カバー操作あり」の2値分岐だが、サブエージェントがエラー系ステータスを返した場合の対処が未定義だったため補完する
- 出力フォーマット「### 判定」セクションの値とSKILL.md Step3の状態判定条件の文字列一致を明示し、連携の確実性を保証する

---

## 新規追加の設計

### usecase-removal-prompt.md
- **用途**: プログラム実現不可と判定されたUCを usecase-list.md および対応する usecase-{uc名}.md から削除するためのサブエージェントプロンプト
- **配置先**: `skills/fs-design-phase6-usecase/usecase-removal-prompt.md`
- **内容**: 以下の全体構成で作成する

```markdown
# ユースケース削除 プロンプトテンプレート

## あなたの役割

あなたは「ユースケース削除エージェント」です。指定されたユースケースを成果物ファイルから削除する作業を実行します。

## feature_name

{feature_name}

## 削除対象

{removal_targets}

※ removal_targets は以下の形式で渡される:
| UC-ID | ユースケース名 | 削除理由 |
|---|---|---|
| {UC-ID} | {ユースケース名} | {プログラム実現不可の理由} |

## 入力ファイル

以下のファイルを読み込むこと:
- `.aide/specs/{feature_name}/usecases/usecase-list.md` — UC一覧（編集対象）

## 実行手順

### 1. usecase-list.md からの該当UC行削除

- usecase-list.md を Read で読み込む
- 「## ユースケース一覧」セクション内の各利用者テーブルから、削除対象UC-IDの行を削除する
- 「## 網羅性チェック」セクション内の対応UC列から、削除対象UC-IDへの参照を削除する
- 「## 概要」セクションの「UC総数」を更新する
- 変更箇所に `<!-- 削除: プログラム実現不可 ({削除理由の要約}) -->` コメントを付ける

### 2. 対応する usecase-{uc名}.md ファイルの削除

- 削除対象の各UC-IDに対応する `.aide/specs/{feature_name}/usecases/usecase-{uc名}.md` ファイルを削除する
- ファイルが存在しない場合はスキップする（エラーとしない）

### 3. 削除結果の確認

- usecase-list.md を再読み込みし、削除対象のUC-IDが残っていないことを確認する
- 削除により UC-ID の連番に欠番が生じるが、既存UC-IDの採番変更は行わない（他のドキュメントとの参照整合性を維持するため）

## 注意事項

- 削除対象以外のUCの内容を変更しない
- UC-IDの再採番は行わない（欠番を許容する）
- usecase-list.md の構造（ヘッダ階層、テーブル形式）を維持する
- 削除対象UCが他のUCの代替フローや関連画面で参照されている場合は、参照箇所に `<!-- 注意: {UC-ID} は削除済み（プログラム実現不可） -->` コメントを付記する

## 報告フォーマット

完了時に以下を報告すること:

- **Status:** {以下のいずれか}
  - `DONE` — 指定された全UCの削除が正常に完了した
  - `DONE_WITH_CONCERNS` — 削除は完了したが、懸念事項がある（例: 削除対象UCが他のUCから参照されていた等）。懸念事項の内容を併記すること
  - `NEEDS_CONTEXT` — 削除に必要な情報が不足している。不足情報を併記すること
  - `BLOCKED` — 外部要因により削除を実行できない。ブロック要因を併記すること
  - `FAIL` — 回復不能なエラーが発生した。エラー内容を併記すること
- 削除したUC-IDの一覧
- 削除した usecase-{uc名}.md ファイルの一覧
- 削除後のUC総数
- 他UCからの参照があった場合はその箇所の一覧
```

---

### 変更対象9: SKILL.md — Integration プロンプトテンプレートリストの更新

#### before
```markdown
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `usecase-lister-prompt.md` — Step 2（mode: phase6_list / fix）
- `usecase-coverage-reviewer-prompt.md` — Step 3（mode: review）【新規作成】
- `usecase-process-analyzer-prompt.md` — Step 5〜（mode: phase6_process / fix）
- `usecase-usability-evaluator-prompt.md` — Step 6（mode: phase6_eval / fix）、Step 8 再評価（mode: fix）
- `usecase-improver-prompt.md` — Step 7（mode: phase6_improve / fix）、Step 8 再評価追記（mode: fix）
- `usecase-improvement-fix-prompt.md` — Step 8（mode: fix / system-architecture.md・gui-design.md の修正）
```

#### after
```markdown
**プロンプトテンプレート（本スキルディレクトリ配下）:**
- `usecase-lister-prompt.md` — Step 2（mode: phase6_list / fix）
- `usecase-coverage-reviewer-prompt.md` — Step 3（mode: review）【新規作成】
- `usecase-process-analyzer-prompt.md` — Step 5〜（mode: phase6_process / fix）
- `usecase-usability-evaluator-prompt.md` — Step 6（mode: phase6_eval / fix）、Step 8 再評価（mode: fix）
- `usecase-improver-prompt.md` — Step 7（mode: phase6_improve / fix）、Step 8 再評価追記（mode: fix）
- `usecase-improvement-fix-prompt.md` — Step 8（mode: fix / system-architecture.md・gui-design.md の修正）
- `usecase-removal-prompt.md` — Step 5 プログラム実現不可UC削除サブフロー【新規作成】
```

#### 変更理由
新規作成する usecase-removal-prompt.md を SKILL.md の Integration セクション内のプロンプトテンプレートリストに登録し、スキルが管理する全プロンプトの一覧を正確に保つ。

---

## インターフェース影響サマリ

本件はスキル定義ファイル（Markdown）のセクション追加が主体であり、コードシグネチャの変更はない。ただし、以下の「状態判定の参照値」に相当する変更がある:

| 変更箇所 | 影響を受ける参照元 | 影響内容 |
|---|---|---|
| SKILL.md Step2 完了条件から「ユーザー合意」削除 | SKILL.md Step2 状態判定 | Step2内でユーザー合意を待つ分岐が不要になる |
| SKILL.md Step2/Step5 状態判定に FAIL 分岐追加 | サブエージェント（usecase-lister, usecase-process-analyzer） | FAIL ステータスを返却可能になる（新規追加のため既存動作に影響なし） |
| SKILL.md Step5 状態判定にプログラム実現不可UCサブフロー追加 | usecase-process-analyzer-prompt.md | DONE_WITH_CONCERNS + プログラム実現不可UC一覧を出力する連携が成立する |
| usecase-coverage-reviewer-prompt.md 「### 判定」→「結果:」行の値 | SKILL.md Step3 状態判定 | 文字列一致を明示。既存の値（「全操作カバー済み」「未カバー操作あり（{N}件）」）に変更なし |
| usecase-removal-prompt.md（新規） | SKILL.md Step5 プログラム実現不可UCサブフロー | 新規ファイルのため既存への影響なし。Step5から起動される |

**呼び出し元への影響:**
- `fs-design-phase5-gui` → 影響なし（呼び出しインターフェース: feature_name, mode に変更なし）
- `fs-design-phase7-ddd` → 影響なし（フェーズ間遷移インターフェースに変更なし）

---

## 更新が必要な設計資料

| 設計資料 | 更新内容 |
|---|---|
| `program-structure.md` | `skills/fs-design-phase6-usecase/` 配下のプロンプトテンプレートリストに `usecase-removal-prompt.md` を追記（phase6プロンプトテンプレート一覧を管理するセクションが存在する場合） |
