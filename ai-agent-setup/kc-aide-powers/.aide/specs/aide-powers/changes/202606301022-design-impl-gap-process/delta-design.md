# 差分設計書 — 設計漏れ・実装漏れ発見時の対策プロセス定義

## 変更概要

対応方針（approach.md）に基づき、以下の差分設計を行う:

1. **新規追加**: `skills/fs-impl-phase5-final-check/design-impl-gap-process.md` — 設計漏れ・実装漏れ発見時の対策プロセス全体定義
2. **既存変更**: `skills/fs-impl-phase5-final-check/SKILL.md` — Step 1 状態判定に異常系プロセスへの参照追加
3. **既存変更**: 合理的乖離概念の廃止と乖離種別判定への移行（18ファイル） — 詳細は分割ファイル参照

---

## 分割ファイル索引

| ファイル | 内容 |
|---|---|
| `delta-design.md`（本ファイル） | 全体設計方針 + 起動条件拡張 + 新規追加ファイル設計 + fs-impl-phase5-final-check 変更 + 要件トレーサビリティ |
| `delta-design-deprecate-rational-deviation.md` | 合理的乖離概念の廃止と乖離種別判定への移行: 18ファイルの before→after 差分設計 |

---

## 1. 新規追加: `skills/fs-impl-phase5-final-check/design-impl-gap-process.md`

### 概要

以下のいずれかのパスで設計漏れ・実装漏れが検出された場合に参照される異常系プロセス定義ファイル。正常系 SKILL.md のコンテキスト肥大化を防止するため、別ファイルとして定義する。

### ファイル全体設計

```markdown
# 設計漏れ・実装漏れ発見時の対策プロセス

本ファイルは以下のいずれかのパスで設計漏れ・実装漏れが検出された場合に参照される
異常系プロセス定義である。

正常系（全項目 ✅、不具合報告なし）の場合は本ファイルを読み込む必要はない。

---

## 起動パスと入力情報

本プロセスは以下の3パスのいずれかから起動される:

| パス | 検出元 | 入力情報 |
|---|---|---|
| パス1 | fs-impl-phase5-final-check Step 1（final-design-audit-agent） | ❌ 項目一覧（設計書×実装コードの照合結果） |
| パス2 | coding-test-2review 内 design-review-agent（FAIL_PENDING を検出し、種別確定フローで設計漏れと確定） | 設計準拠レビューで検出された種別未確定差分のうち、設計漏れと確定された項目 |
| パス3 | 動作確認Step（ユーザー指摘/不具合報告） | ユーザーからの不具合報告内容。設計レベルの問題かの判定が必要 |

### パスごとの起動詳細

**パス1: fs-impl-phase5-final-check Step 1（既存）**
- `final-design-audit-agent` が全設計書横断照合で ❌ を検出した場合
- 入力: final-design-audit-agent の出力（❌ 項目一覧）
- 漏れ種別（設計漏れ / 実装漏れ）は出力から直接判定可能

**パス2: coding-test-2review 内 設計準拠レビューでの乖離検出**
- design-review-agent が設計準拠レビューで差分を検出した場合
- この時点では乖離種別（設計漏れ / 実装誤り）を確定せず、一旦 FAIL 判定とする
- FAIL 詳細（どの差分があるか）を工程チェック表に記録し、当該タスクは FAIL 保留状態とする
- 乖離種別確定のトリガー:
  - 全タスクの実装が完了した時点
  - または FAIL が解消できず後続タスクが実行不可能になった時点（依存関係でブロック）
- トリガー到達後、蓄積された未確定差分を **1件ずつ** ユーザーに提示し種別を確定する:
  - **実装誤り**: 設計書が正しく実装が未準拠 → fix で実装を修正し再レビュー
  - **設計漏れ**: 実装が正しく設計書が未反映 → design-sync で設計書を更新（fix モード）
- 設計漏れと確定した項目は、設計書修正後に本プロセスのプロセス B の対象となる

**パス3: 動作確認Step でのユーザー指摘/不具合発覚**
- fs-impl-phase5-final-check Step 3 相当、または fs-change-phase2-impl Step 12 でユーザーが不具合を報告した場合
- 入力: ユーザーからの不具合報告内容
- 前処理として「設計レベルの問題か、実装レベルの問題か」を判定する:
  - 設計書に定義が不足 → 設計漏れ（プロセス B）
  - 設計書に定義はあるが実装に反映されていない → 実装漏れ（プロセス A）
  - 設計・実装ともに存在するがロジック不具合 → 本プロセスの対象外（通常のバグ修正フローへ）

---

## 基本原則

- **治るまでやる**: 設計修正・実装リトライは完了するまで繰り返すことが基本原則である。上限で停止はしない
- **10回繰り返しユーザー相談**: 10回繰り返しても解消しない場合は前工程に問題がある可能性があるため、ユーザーに相談する。ユーザーが「続けろ」と言えば再度10回の繰り返しカウントをリセットして続行する
- **漏れの区別**: 検出元の出力から「設計漏れ」と「実装漏れ」を区別し、適切なプロセスに分岐する


---

## プロセス A: 実装漏れ検出時の対策プロセス（REQ-C-001）

### 起動条件

以下のいずれかで実装漏れが検出された場合:
- パス1: `final-design-audit-agent` が ❌ を検出し、その原因が「実装漏れ」と判定された場合
- パス2: 乖離種別確定フローでユーザーが「実装誤り」と確定した差分について、fix→再レビューループで対応する（通常の fix ループで解消）
- パス3: ユーザー指摘の不具合が「設計書に定義はあるが実装に反映されていない」と判定された場合

共通条件: 設計書にはクラス・メソッド・不変条件・テスト観点が定義されているが、実装コードに反映されていない。

### プロセスフロー

1. **タスクリスト再作成**: `final-design-audit-agent` が検出した ❌ 項目を `impl-task-list.md`（2層構造）および `impl-process-checklist.md` に新規タスクとして追記する（これは final-design-audit-agent 自身が Step 1 の呼び出し時に実行する既存の動作）

2. **実装ループ実行**: `coding-test-2review (aide-powers skill)` を activate して追加タスクを実装する。呼び出しパラメータは Step 1 の既存定義に従う

3. **再監査**: 実装ループ完了後、`final-design-audit-agent` を再度呼び出し、全項目を横断照合する

4. **ループ終了判定**:
   - 全項目 ✅（❌ = 0件）→ 正常系に復帰（Step 2 へ遷移）
   - まだ ❌ あり → 手順 1〜3 を繰り返す

5. **10回繰り返しユーザー相談**（プロセス C を適用）:
   - 上記ループを10回繰り返しても全項目 ✅ にならない場合、プロセス C に従いユーザーに相談する

---

## プロセス B: 設計漏れ検出時の対策プロセス（REQ-C-002）

### 起動条件

以下のいずれかで設計漏れが検出された場合:
- パス1: `final-design-audit-agent` が ❌ を検出し、その原因が「設計漏れ」と判定された場合
- パス2: 乖離種別確定フローでユーザーが「設計漏れ」と確定した差分について、design-sync（fix モード）で設計書を更新した後、残存する不整合がある場合
- パス3: ユーザー指摘の不具合が「設計書に定義されるべき項目が存在しない」と判定された場合

共通条件: 設計書に定義されるべきクラス・メソッド・不変条件・テスト観点が設計書に存在しない。

### プロセスフロー

1. **該当設計フェーズスキル（FS）の特定**: 設計漏れの内容から、どの設計 FS（`fs-design-phase*`）の成果物に不足があるかを特定する
   - 例: オブジェクト設計の漏れ → `fs-design-phase8-object` 関連
   - 例: インフラIF設計の漏れ → `fs-design-phase9-infra` 関連
   - 例: プログラム構成の漏れ → `fs-design-phase10-program` 関連

2. **該当 FS の再実行（前処理・後処理なし）**: 特定した設計 FS を、前処理（progress-resume-check / phase-report-check）・後処理（phase-report-check(write) / git-commit-workflow）を**実行せず**に、本体の Step のみを直接実行する
   - 目的: 設計書の不足部分を補完する
   - 入力: 現在の設計書群と、`final-design-audit-agent` が指摘した漏れ箇所の情報
   - 出力: 更新された設計書

3. **後続 FS の継続実行（影響がある場合のみ）**: プログラム構成が変わる等、後続 FS の成果物にも影響がある場合は、影響を受ける後続 FS も同様に前処理・後処理なしで再実行する
   - 影響判定の基準: 再実行した FS の成果物が、後続 FS の入力として使われている場合
   - 例: `fs-design-phase8-object` を再実行 → 新クラスが追加された → `fs-design-phase9-infra`（リポジトリ実装）と `fs-design-phase10-program`（ファイル配置）にも影響

4. **差分タスクリスト追加**: 設計書の更新で新たに追加された定義（クラス・メソッド・テスト観点等）に基づき、`impl-task-list.md`（2層構造）および `impl-process-checklist.md` にタスクを追加する。タスク追加は `impl-task-planning (aide-powers skill)` の手法に従う

5. **実装ループ実行**: `coding-test-2review (aide-powers skill)` を activate して追加タスクを実装する

6. **再監査**: 実装ループ完了後、`final-design-audit-agent` を再度呼び出し、全項目を横断照合する

7. **ループ終了判定**:
   - 全項目 ✅（❌ = 0件）→ 正常系に復帰（Step 2 へ遷移）
   - まだ ❌ あり → 漏れの種別を判定し、プロセス A またはプロセス B を再度適用する

8. **10回繰り返しユーザー相談**（プロセス C を適用）:
   - 上記ループ（プロセス A とプロセス B の合算）を10回繰り返しても全項目 ✅ にならない場合、プロセス C に従いユーザーに相談する

---

## プロセス C: 10回繰り返しユーザー相談（REQ-C-003）

### 起動条件

プロセス A とプロセス B の繰り返し回数（合算）が10回に達し、まだ全項目 ✅ にならない場合。

### プロセスフロー

1. **ユーザーへの報告**: 以下の情報をユーザーに提示する
   - 繰り返し回数: 10回
   - 残存する ❌ 項目の一覧（最新の final-design-audit-agent の出力から）
   - 考えられる原因: 前工程（設計WF / 実装WF phase4）に根本的な問題がある可能性
   - 選択肢:
     1. 続行する（再度10回の繰り返しを許可）
     2. 手動で問題を確認・修正する（ワークフローを一時中断）
     3. その他（自由記述）

2. **ユーザー選択に応じた対応**:
   - **選択肢 1「続行する」**: 繰り返しカウントを 0 にリセットし、再度プロセス A / B を適用する（再び10回まで繰り返し可能）
   - **選択肢 2「手動確認」**: 現在の状況をレポートに記録し、ユーザーの指示を待つ
   - **選択肢 3「その他」**: ユーザーの指示に従う

### 繰り返し回数のカウントルール

- プロセス A（実装漏れ対策のループ1回）= 1回としてカウント
- プロセス B（設計漏れ対策のループ1回）= 1回としてカウント
- プロセス A と B が混在する場合は合算でカウント
- ユーザーが「続行」を選択した場合、カウントは 0 にリセットされる

---

## 漏れ種別の判定基準

`final-design-audit-agent` の出力から、❌ 項目が「設計漏れ」か「実装漏れ」かを以下の基準で判定する:

| 判定 | 条件 |
|---|---|
| **実装漏れ** | 設計書に当該クラス・メソッド・不変条件・テスト観点の定義が**存在する**が、対応する実装コードが**存在しない** |
| **設計漏れ** | 設計書に定義されるべき項目が**存在しない**（ユーザー要件書には記載があるが設計書に落とし込まれていない、または設計書間の参照に不整合がある） |
| **混在** | 同一監査結果に設計漏れと実装漏れの両方が含まれる場合、設計漏れ対策（プロセス B）を**先に**実行する。設計が補完された後、残りの実装漏れをプロセス A で対処する |

---

## 参照関係

| 参照先 | 用途 |
|---|---|
| `coding-test-2review (aide-powers skill)` | 追加タスクの実装ループ |
| `final-design-audit-agent (aide-powers agent)` | 全設計書横断照合（再監査） |
| `impl-task-planning (aide-powers skill)` | 差分タスクリスト作成の手法参照 |
| `fs-design-phase8-object (aide-powers skill)` | 設計漏れ時の再実行対象（オブジェクト設計） |
| `fs-design-phase9-infra (aide-powers skill)` | 設計漏れ時の再実行対象（インフラIF設計） |
| `fs-design-phase10-program (aide-powers skill)` | 設計漏れ時の再実行対象（プログラム構成） |
```

---

## 2. 既存変更: `skills/fs-impl-phase5-final-check/SKILL.md`

### 変更理由

Step 1 の状態判定で ❌ が検出された場合に、異常系プロセス（design-impl-gap-process.md）を参照して対策を実行するフローを追加する。ユーザー指示「異常系プロセスは正常系と別ファイルに定義し、正常系には参照のみ記載する」に準拠。

### 変更箇所 1: Step 1 状態判定セクション

**before:**
```markdown
### 状態判定
完了条件を満たし"全項目照合結果(Step1)"が全項目✅の場合 Step2 へ遷移する。

- ❌ありの場合
  - 監査エージェントが追記したタスクを coding-test-2review で追加実装した後、`final-design-audit-agent` による再監査を実行し全項目✅になるまで繰り返す
- coding-test-2review が status: BLOCKED を返した場合
  - ユーザーに報告し対応方針を確認する
```

**after:**
```markdown
### 状態判定
完了条件を満たし"全項目照合結果(Step1)"が全項目✅の場合 Step2 へ遷移する。

- ❌ありの場合
  - 本スキルディレクトリの `design-impl-gap-process.md` を Read で読み込み、漏れ種別（設計漏れ / 実装漏れ）に応じた対策プロセスに従う
  - 実装漏れ → プロセス A に従い、タスクリスト再作成 → coding-test-2review → 再監査を全項目✅になるまで繰り返す
  - 設計漏れ → プロセス B に従い、該当設計FSの再実行 → 差分タスクリスト追加 → coding-test-2review → 再監査を全項目✅になるまで繰り返す
  - 10回繰り返しても解消しない場合 → プロセス C に従いユーザーに相談する
- coding-test-2review が status: BLOCKED を返した場合
  - ユーザーに報告し対応方針を確認する
```

### 変更箇所 2: Integration セクション（末尾に追加）

**before:**
```markdown
**Global rules:** `.aide/references/global-rules.md` を厳守
```

**after:**
```markdown
**異常系プロセス定義（❌検出時に参照）:**
- `design-impl-gap-process.md`（本スキルディレクトリ内）— 設計漏れ・実装漏れ発見時の対策プロセス（プロセスA: 実装漏れ対策 / プロセスB: 設計漏れ対策 / プロセスC: 10回繰り返しユーザー相談）

**Global rules:** `.aide/references/global-rules.md` を厳守
```

---

## 2.5. 新規追加: phase-skill-rules.md への全体ルール追加（REQ-C-005）

### 変更理由

設計不備（設計漏れ・実装漏れ）はワークフローの任意のフェーズで発覚する可能性がある。design-impl-gap-process.md の起動を特定パス（fs-impl-phase5-final-check / coding-test-2review / 動作確認Step）に限定するのではなく、全フェーズスキル共通ルール（phase-skill-rules.md）に「設計不備発見時の対応ルール」を追加し、どのフェーズからでも対策プロセスを起動できるようにする。

### 追加位置

`.aide/references/phase-skill-rules.md` の「## 作業中の他ワークフロー起動禁止」セクションの直後、「## 設計書なしの実装禁止」セクションの直前に挿入する。

### 追加内容（before→after）

**before:**
（「## 作業中の他ワークフロー起動禁止」セクションの直後に「## 設計書なしの実装禁止」セクションが続く。その間に「設計不備発見時の対応ルール」セクションは存在しない）

**after:**
```markdown
---

## 設計不備発見時の対応ルール

ワークフローのどのフェーズであっても、設計書と実装の不整合（設計漏れ・実装漏れ）を発見した場合は、以下のルールに従うこと。

### 発見時の即時対応

1. **問題の記録**: 発見した設計不備の内容を pending-issues.md に記録する（`pending-issues-management` スキル経由）
2. **現フェーズの完了を優先**: 現在実行中のフェーズの作業を中断せず、完了まで進める
3. **フェーズ完了後に対策プロセスを起動**: 現フェーズ完了後、`skills/fs-impl-phase5-final-check/design-impl-gap-process.md` を参照し、漏れ種別（設計漏れ / 実装漏れ）に応じた対策プロセス（A / B）を実行する

### 即時対応が必要な場合の例外

以下の場合は現フェーズを中断して即時対応する:
- 設計不備により後続の作業が論理的に不可能な場合（依存ブロック）
- ユーザーが即時修正を指示した場合

### 対策プロセスへの参照

対策プロセスの詳細（プロセスA: 実装漏れ対策 / プロセスB: 設計漏れ対策 / プロセスC: 10回繰り返しユーザー相談）は `skills/fs-impl-phase5-final-check/design-impl-gap-process.md` に定義されている。このファイルは実装WFに限らず、どのワークフロー・どのフェーズからでも参照可能な汎用プロセス定義である。
```

### 設計上の留意点

- design-impl-gap-process.md 自体の「起動パスと入力情報」セクションは現行のまま維持する（パス1/2/3 は実装WF内の具体的な検出トリガーの定義であり、これらが消えるわけではない）
- 全体ルールは「これ以外のフェーズでも設計不備を発見したら同じプロセスを適用できる」という汎用的な入口を提供する
- 影響ファイル: `skills/using-aide-powers/references/phase-skill-rules.md`（正本）→ `.aide/references/phase-skill-rules.md`（配布版）

---

## 3. 既存変更: 合理的乖離概念の廃止と乖離種別判定への移行（REQ-C-004）

### 変更概要

「合理的乖離」という概念を廃止し、設計と実装の差分を「明らかな実装誤り（FAIL）」か「種別未確定（FAIL_PENDING）」として扱い、後者は実装完了/停止後にユーザーと種別確定（実装誤り / 設計漏れ）する方式に移行する。

### 変更理由

設計と実装が異なることに「合理的」な乖離はない。設計漏れ（設計書が実装の実態を反映していない）か、実装誤り（設計書通りに実装されていない）かのどちらかである。

### 新しい判定フロー

```
差分検出 → 乖離種別の判定
  ├─ 明らかな実装誤り（FAIL）: 設計書の定義が技術的に正しく実装可能。実装が設計に準拠していない
  │   → 即 fix で実装を修正 → 再レビュー（従来通り）
  └─ 種別未確定（FAIL_PENDING）: 実装の制約で設計通りにできない可能性がある差分
      → 保留。実装完了 or 依存ブロック後にユーザーと種別確定
        ├─ 実装誤りと確定 → fix で実装を修正 → 再レビュー
        └─ 設計漏れと確定 → design-sync で設計書を更新
```

### 新しい判定ステータス

| ステータス | 意味 | 後続アクション |
|---|---|---|
| **PASS** | 差分0件 | 次工程へ |
| **FAIL** | 明らかな実装誤り（設計書が正しく実装可能。種別確定済み） | 即 fix で実装を修正 → 再レビュー（従来通り） |
| **FAIL_PENDING** | 種別未確定の差分（実装の制約で設計通りにできない可能性あり） | 保留。実装完了 or 依存ブロック後にユーザーと種別確定 |

### 廃止される概念

- 「合理的乖離（要承認）」判定種別
- `PASS_WITH_DEVIATION` ステータス
- 「ユーザー承認フロー」（レビュー中に合理的乖離検出 → ユーザーに提示 → 承認/却下）
- `Rational Deviation Rules` セクション

### 影響を受けるファイル一覧

詳細な before→after は分割ファイル `delta-design-deprecate-rational-deviation.md` に記載。

| # | ファイル | 変更概要 |
|---|---|---|
| 1 | `skills/multi-stage-code-review/SKILL.md` | Review Result Handling の判定フロー変更。レビュー中の即時ユーザー承認フロー廃止 |
| 2 | `skills/coding-test-2review/SKILL.md` | 設計準拠レビュー FAIL 時の分岐変更。FAIL保留→種別確定フロー追加 |
| 3 | `skills/coding-test-2review/spec-reviewer-prompt.md` | 合理的乖離の許容ルール → 乖離種別判定ルール |
| 4 | `skills/design-sync/SKILL.md` | Phase 2 変更 + Rational Deviation Rules 廃止。起動タイミングが「レビュー中即時」→「種別確定後」に変更 |
| 5 | `skills/import-review/SKILL.md` | 「合理的乖離ルールの対象外」→「設計漏れ判定の対象外」 |
| 6 | `skills/fs-impl-phase4-execution/SKILL.md` | Integration 記述変更 |
| 7 | `skills/fs-impl-phase4-execution/spec-reviewer-prompt.md` | 合理的乖離の許容ルール → 乖離種別判定ルール |
| 8 | `skills/fs-impl-phase5-final-check/SKILL.md` | Integration 記述変更 |
| 9 | `skills/fs-change-phase2-impl/SKILL.md` | Integration 記述変更 |
| 10 | `skills/fs-bugfix-phase2-impl/SKILL.md` | Integration 記述変更 |
| 11 | `skills/fs-refactoring-phase5-impl/SKILL.md` | Integration 記述変更 |
| 12 | `skills/fs-refactoring-phase5-impl/spec-reviewer-prompt.md` | 合理的乖離の判定 → 乖離種別判定 |
| 13 | `agents/design-review-agent.md` | ステップ5 変更: ユーザー承認フロー削除。FAILを返すのみに簡素化 |
| 14 | `agents/kiro/design-review-agent.md` | 同上 |
| 15 | `agents/kiro/prompts/design-review-agent-prompt.md` | 同上 |
| 16 | `docs-dev/02-ai-agent/04-agents/implementation-agents.md` | 判定種別・PASS条件の記述変更 |
| 17 | `docs-dev/02-ai-agent/03-common-skills/impl.md` | 「合理的乖離ルールの対象外」→「設計漏れ判定の対象外」 |
| 18 | `docs-dev/02-ai-agent/03-common-skills/infrastructure.md` | design-sync 呼び出し元の記述変更 |

### 承認タイミングの変更（全体影響）

旧: レビュー中に即時ユーザー承認を取得 → design-sync 起動 → 設計書更新 → 再レビュー
新: FAIL保留 → 実装完了 or 依存ブロック → ユーザーと種別確定 → 設計漏れなら design-sync → 設計書更新

この変更により:
- design-review-agent はユーザーとの対話を行わない（差分検出→FAIL報告のみ）
- ユーザーとの対話は coding-test-2review の乖離種別確定フロー（実装完了/停止時）に集約される
- design-sync の起動タイミングが「レビュー中即時」→「種別確定後」に遅延する（design-sync の内部ロジック自体は維持）

---

## 更新が必要な設計資料

| 設計資料 | 更新内容 | 更新タイミング |
|---|---|---|
| `program-structure.md` | `skills/fs-impl-phase5-final-check/` フォルダのファイル一覧に `design-impl-gap-process.md`（異常系プロセス定義）を追加。スキル内部構造の定義に、プロセス定義ファイル（`*-process.md`）パターンを追加（対応済み） | 実装完了後 |
| `skills/using-aide-powers/references/phase-skill-rules.md`（正本） | 「設計不備発見時の対応ルール」セクションを追加 | 実装時 |
| `.apm/instructions/aide-powers-phase-skill-rules.instructions.md` | 正本 phase-skill-rules.md の内容を APM 形式（front-matter: `description` + `applyTo: "**"`）で同期更新 | 実装時（正本変更と同時） |
| `.aide/specs/aide-powers/program-structure.md` | `references/phase-skill-rules.md` セクションに「⚠️ 変更時の連動ファイル」注記を追加（version.json +1、.apm/instructions/aide-powers-phase-skill-rules.instructions.md 同期、rules-distribute 配布トリガー） | 実装時 |

---

## 要件トレーサビリティ

| 要件ID | 対応する設計箇所 |
|---|---|
| REQ-C-001 | プロセス A（実装漏れ検出時の対策プロセス） |
| REQ-C-002 | プロセス B（設計漏れ検出時の対策プロセス） |
| REQ-C-003 | プロセス C（10回繰り返しユーザー相談） |
| REQ-C-004 | 合理的乖離概念の廃止と乖離種別判定への移行（分割ファイル） |
| AC-001-1 | プロセス A 手順 1（タスクリスト再作成） |
| AC-001-2 | プロセス A 手順 2（coding-test-2review による実装ループ） |
| AC-001-3 | プロセス A 手順 4（ループ終了条件: 全タスク完了 = 全項目✅） |
| AC-002-1 | プロセス B 手順 2（該当FSを前処理・後処理なしで再実行） |
| AC-002-2 | プロセス B 手順 3（後続FSの継続実行） |
| AC-002-3 | プロセス B 手順 4（差分タスクリスト追加） |
| AC-002-4 | プロセス B 手順 5〜7（coding-test-2review → 再監査 → 全量完了まで繰り返し） |
| AC-003-1 | プロセス C 基本原則「治るまでやる」 |
| AC-003-2 | プロセス C 手順 1（10回で解消しない場合のユーザー相談） |
| AC-003-3 | プロセス C 手順 2 選択肢1（続行指示で再度10回） |
| REQ-C-005 | セクション 2.5（phase-skill-rules.md への全体ルール追加） |
| AC-005-1 | phase-skill-rules.md に「設計不備発見時の対応ルール」セクション追加 |
| AC-005-2 | 「対策プロセスへの参照」にて design-impl-gap-process.md を汎用プロセス定義として位置づけ |
| AC-005-3 | 「発見時の即時対応」手順1〜3 で任意フェーズからの起動手順を明確化 |
| AC-005-4 | .apm/instructions/ のAPM配布版ファイル同期更新 |
| AC-005-5 | program-structure.md に phase-skill-rules.md 変更時の連動ファイル注記を追加 |
