# 差分設計: final-check 系7スキルの一時ファイルクリーンアップ範囲拡張と想定外残ファイルのユーザー確認削除（REQ-C-010）

> メインファイル: delta-design.md の既存変更 C-5 より分割

> 入力: change-requirements.md（REQ-C-010 / AC-010-1〜5）／ approach.md（REQ-C-010 節）／ delta-design-overview.md（2.4・申し送り U-2）。
> 本ファイルは対応方針（approach.md）に従って差分設計を起こしたものであり、対応方針自体は変更していません。
> before は対象7スキルの現行 SKILL.md（`skills/fs-*-final-check/SKILL.md`）の実際の記述を Read で確認した文字列をそのまま転記しています。

## 1. 設計概要（何を・なぜ）

- **何を:** 各ワークフロー末尾の final-check 系7スキルが実行する `.aide/tmp/` の一時ファイルクリーンアップ処理について、(a) 削除対象を `session-history-*.txt` のみから `session-history-*.{txt,png,err}`（3拡張子）へ拡張し、(b) クリーンアップ時に session-history 系以外の想定外残ファイルがあればユーザーへ一覧提示して削除可否を確認する工程を追加する。あわせて (c) 一部スキルの Iron Law / 完了条件に残る `session-history-*.txt` 表現を3拡張子表現へ整合させる。
- **なぜ:** 本変更で screenshot-capture（REQ-C-001）が履歴書き出しと同時に `.aide/tmp/session-history-{skill_name}-{step_id}.png`（撮影失敗時は同名ベースの `.err`）を新規生成するようになる。現行のクリーンアップは `session-history-*.txt` のみを削除対象とするため、`.png`/`.err` が清掃されず次回ワークフローへ持ち越される。これを防ぎ `.aide/tmp/` を確実に清掃するために、削除対象範囲を拡張する。さらに、スクショ物証導入で `.aide/tmp/` に多様なファイルが生まれうるため、想定外の残ファイルをユーザー判断で安全に整理できるようにする。
- **位置づけ（申し送り U-2 の正式スコープ内化）:** delta-design-overview.md 2.4 / 申し送り U-2 は「クリーンアップ glob 拡張は本変更スコープ外・別途変更WFで対応」としていたが、ユーザー決定により本 REQ-C-010 で本変更内に取り込み正式対応する。これは旧申し送りからの方針変更である。

## 2. 対象7スキル

| # | スキル（`skills/{name}/SKILL.md`） | WF | 改修対象 Step | Pattern B（Iron Law/完了条件）有無 |
|---|---|---|---|---|
| 1 | fs-bugfix-phase3-final-check | バグ修正 | ### Step 2: 一時ファイルの削除 | あり（Iron Law + 完了条件） |
| 2 | fs-change-phase3-final-check | 変更 | ### Step 2: 一時ファイルの削除 | あり（Iron Law + 完了条件） |
| 3 | fs-design-phase11-final-check | 設計 | ### Step 2: 一時ファイルの削除 | なし |
| 4 | fs-impl-phase7-final-check | 実装 | ### Step 2: 一時ファイルの削除 | なし |
| 5 | fs-planning-phase4-final-check | 企画 | ### Step 2: 一時ファイルの削除 | なし |
| 6 | fs-refactoring-phase7-final-check | リファクタリング | ### Step 2: 一時ファイルの削除 | なし |
| 7 | fs-reverse-phase6-final-check | 逆引き | ### Step 2: 一時ファイルの削除 | なし |

## 3. 改修箇所の分類（記述パターン2系統・3バリアント）

7スキルの現行記述は以下に整理できる。改修1・改修2は系統A（Step 2 本体）に、改修3は系統B（bugfix/change のみ）に適用する。

- **系統A: Step「一時ファイルの削除」のクリーンアップ処理本体（7スキル全て）** — さらに表現の揺れで3バリアント。
  - A1（番号付き「**処理:**」2項目形式）: fs-bugfix-phase3 / fs-change-phase3
  - A2（「検証完了後、〜削除する。」一文形式）: fs-design-phase11
  - A3（「〜削除する（次回ワークフロー実行時の誤判定防止）。」一文形式）: fs-impl-phase7 / fs-planning-phase4 / fs-refactoring-phase7 / fs-reverse-phase6
- **系統B: Iron Law / 完了条件の `session-history-*.txt` 参照表現（fs-bugfix-phase3 / fs-change-phase3 のみ）** — 他5スキルには Iron Law 節・完了条件節が存在しないため対象外。

## 4. 改修1: 削除対象 glob 拡張（AC-010-1 / AC-010-2）

各スキルの「一時ファイルの削除」Step の削除対象を `.aide/tmp/session-history-*.txt` から `.txt`/`.png`/`.err` の3拡張子を削除する記述へ拡張する。表現の揺れに応じて A1〜A3 の代表 before→after を示す。

**変更理由:** screenshot-capture（REQ-C-001）が `.aide/tmp/session-history-{skill_name}-{step_id}.png`（失敗時 `.err`）を新規生成するため、`.txt` のみ削除では `.png`/`.err` が残置し次回ワークフローへ持ち越される。削除対象を3拡張子へ拡張して確実に清掃する（AC-010-1）。対象7スキル全てに同一拡張を漏れなく適用する（AC-010-2、task-orchestration で並列適用）。

### 4.1 代表 before→after（A1: fs-bugfix-phase3 / fs-change-phase3）

現行は「**処理:**」配下に番号付き2項目を持つ。1項目目の削除対象 glob を拡張する。

**before（現行・fs-bugfix-phase3 / fs-change-phase3 共通）:**
```markdown
### Step 2: 一時ファイルの削除

**処理:**

1. `.aide/tmp/session-history-*.txt` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止）
2. 削除完了を確認する
```

**after:**
```markdown
### Step 2: 一時ファイルの削除

**処理:**

1. `.aide/tmp/session-history-*.txt`・`.aide/tmp/session-history-*.png`・`.aide/tmp/session-history-*.err` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止。`.png`/`.err` は screenshot-capture が履歴と対で生成するスクショ物証）
2. 削除完了を確認する
3. （改修2: 想定外残ファイルのユーザー確認削除。後述 5 章の手順を追加）
```

> 注: 上記 after の「3.」は改修2（5章）の挿入位置を示す。改修2 の本文記述は 5 章を参照。

### 4.2 代表 before→after（A2: fs-design-phase11）

現行は一文形式（「検証完了後、〜削除する。」）。

**before（現行・fs-design-phase11）:**
```markdown
### Step 2: 一時ファイルの削除

検証完了後、`.aide/tmp/session-history-*.txt` の全ファイルを削除する。
```

**after:**
```markdown
### Step 2: 一時ファイルの削除

検証完了後、`.aide/tmp/session-history-*.txt`・`.aide/tmp/session-history-*.png`・`.aide/tmp/session-history-*.err` の全ファイルを削除する（`.png`/`.err` は screenshot-capture が履歴と対で生成するスクショ物証）。

（このあと改修2: 想定外残ファイルのユーザー確認削除手順を追加。5 章参照）
```

### 4.3 代表 before→after（A3: fs-impl-phase7 / fs-planning-phase4 / fs-refactoring-phase7 / fs-reverse-phase6）

現行は一文形式（「〜削除する（次回ワークフロー実行時の誤判定防止）。」）。4スキル全て同一文字列。

**before（現行・4スキル共通）:**
```markdown
### Step 2: 一時ファイルの削除

`.aide/tmp/session-history-*.txt` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止）。
```

**after:**
```markdown
### Step 2: 一時ファイルの削除

`.aide/tmp/session-history-*.txt`・`.aide/tmp/session-history-*.png`・`.aide/tmp/session-history-*.err` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止。`.png`/`.err` は screenshot-capture が履歴と対で生成するスクショ物証）。

（このあと改修2: 想定外残ファイルのユーザー確認削除手順を追加。5 章参照）
```

### 4.4 改修1 の7スキル × 対応箇所 網羅テーブル

| # | スキル | バリアント | before の削除対象記述（現行・厳密一致） | after の削除対象記述 |
|---|---|---|---|---|
| 1 | fs-bugfix-phase3-final-check | A1 | `1. \`.aide/tmp/session-history-*.txt\` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止）` | `.txt`/`.png`/`.err` の3globを削除（4.1 after の「1.」） |
| 2 | fs-change-phase3-final-check | A1 | `1. \`.aide/tmp/session-history-*.txt\` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止）` | `.txt`/`.png`/`.err` の3globを削除（4.1 after の「1.」） |
| 3 | fs-design-phase11-final-check | A2 | `検証完了後、\`.aide/tmp/session-history-*.txt\` の全ファイルを削除する。` | `.txt`/`.png`/`.err` の3globを削除（4.2 after） |
| 4 | fs-impl-phase7-final-check | A3 | `\`.aide/tmp/session-history-*.txt\` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止）。` | `.txt`/`.png`/`.err` の3globを削除（4.3 after） |
| 5 | fs-planning-phase4-final-check | A3 | `\`.aide/tmp/session-history-*.txt\` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止）。` | `.txt`/`.png`/`.err` の3globを削除（4.3 after） |
| 6 | fs-refactoring-phase7-final-check | A3 | `\`.aide/tmp/session-history-*.txt\` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止）。` | `.txt`/`.png`/`.err` の3globを削除（4.3 after） |
| 7 | fs-reverse-phase6-final-check | A3 | `\`.aide/tmp/session-history-*.txt\` の全ファイルを削除する（次回ワークフロー実行時の誤判定防止）。` | `.txt`/`.png`/`.err` の3globを削除（4.3 after） |

## 5. 改修2: 想定外残ファイルのユーザー確認削除（AC-010-3 / AC-010-4）

各スキルの「一時ファイルの削除」Step に、改修1 の session-history 系（`.txt`/`.png`/`.err`）削除を実施した**後**、`.aide/tmp/` 配下を確認し、session-history 系以外の想定外残ファイルが残っていればユーザーへ一覧提示して削除可否を確認する手順を追加する。ユーザーが削除承認なら削除、残置希望なら残す。

**変更理由:** スクショ物証導入により `.aide/tmp/` に多様なファイル（撮影中間ファイル・誤生成物・他作業の残骸等）が生まれうる。session-history 系の glob 削除だけでは想定外ファイルが残置し次回ワークフローへ持ち越される。ただし想定外ファイルは正当な理由で置かれている可能性もあるため、機械的に一括削除せずユーザー判断を仰ぐ（AC-010-3 で一覧提示・確認、AC-010-4 でユーザー判断を尊重して削除/残置）。

### 5.1 追加する手順（after・全7スキル共通の追記ブロック）

改修1 で示した各バリアントの削除記述の直後に、以下の手順を追加する（A1 は番号付きリストの新項目として、A2/A3 は段落として追記）。

```markdown
**想定外残ファイルの確認削除:**

1. session-history 系（`.txt`/`.png`/`.err`）の削除後、`.aide/tmp/` 配下に残っているファイルを一覧取得する
2. 残ファイルから session-history 系（`session-history-*.{txt,png,err}`）を除いた「想定外ファイル」を抽出する
3. 想定外ファイルが 0 件なら本手順は完了（ユーザー確認は行わない）
4. 想定外ファイルが 1 件以上ある場合、ユーザーへ当該ファイル一覧（ファイル名・サイズ等）を提示し、番号付き選択肢で削除可否を確認する:
   - 1. すべて削除する
   - 2. 残置する（削除しない）
   - 3. その他（自由記述。一部のみ削除する等、ユーザーの指示に従う）
5. ユーザーの選択に従って処理する:
   - 「1. すべて削除する」→ 一覧の想定外ファイルを全て削除する
   - 「2. 残置する」→ 削除しない（次回ワークフローへ持ち越される旨を認識した上での残置）
   - 「3. その他」→ ユーザーの自由記述の指示に従って一部削除等を行う
6. 本確認削除は検証フロー（Step 1 の progress-final-checker による署名検証・進捗更新）の判定結果に一切影響しない（後段の整理処理であり、PASS/FAIL を変えない）
```

> 注: 上記ブロックは SKILL.md 本文へ転記する実行手順であり、要件トレーサビリティID（AC-010-5 等）は本文に含めない。AC との対応は本書 7章・9章で管理する。

### 5.2 各バリアントへの挿入位置

| バリアント | 対象スキル | 挿入位置 |
|---|---|---|
| A1 | fs-bugfix-phase3 / fs-change-phase3 | 「**処理:**」配下の番号付きリスト（削除→削除確認）の後ろに「**想定外残ファイルの確認削除:**」ブロックを追加 |
| A2 | fs-design-phase11 | 「検証完了後、〜削除する。」の段落の後ろに「**想定外残ファイルの確認削除:**」ブロックを追加 |
| A3 | fs-impl-phase7 / fs-planning-phase4 / fs-refactoring-phase7 / fs-reverse-phase6 | 「〜削除する（次回ワークフロー実行時の誤判定防止）。」の段落の後ろに「**想定外残ファイルの確認削除:**」ブロックを追加 |

### 5.3 改修2 の7スキル × 対応箇所 網羅テーブル

| # | スキル | 追加先 Step | 追加内容 |
|---|---|---|---|
| 1 | fs-bugfix-phase3-final-check | Step 2 | 5.1 ブロックを A1 挿入位置に追加 |
| 2 | fs-change-phase3-final-check | Step 2 | 5.1 ブロックを A1 挿入位置に追加 |
| 3 | fs-design-phase11-final-check | Step 2 | 5.1 ブロックを A2 挿入位置に追加 |
| 4 | fs-impl-phase7-final-check | Step 2 | 5.1 ブロックを A3 挿入位置に追加 |
| 5 | fs-planning-phase4-final-check | Step 2 | 5.1 ブロックを A3 挿入位置に追加 |
| 6 | fs-refactoring-phase7-final-check | Step 2 | 5.1 ブロックを A3 挿入位置に追加 |
| 7 | fs-reverse-phase6-final-check | Step 2 | 5.1 ブロックを A3 挿入位置に追加 |

### 5.4 ユーザー確認の方式（global-rules 準拠）

ユーザー確認は aide-powers の global-rules（番号付き選択肢・最後に「その他（自由記述）」・1回1質問・敬語）に準拠する。本手順の選択肢は 5.1 の「1. すべて削除する / 2. 残置する / 3. その他（自由記述）」とし、丁寧な敬語で一覧を提示する。

## 6. 改修3: Iron Law / 完了条件の表現整合（AC-010-1 の波及）

fs-change-phase3-final-check / fs-bugfix-phase3-final-check には、Step 2 本体とは別に Iron Law 節と完了条件節に `session-history-*.txt` を参照する表現が残る。改修1 で削除対象を3拡張子へ拡張するのに伴い、これらの表現も `.png`/`.err` を含む表現へ整合させる。他5スキル（design/impl/planning/refactoring/reverse）には該当する Iron Law 節・完了条件の `session-history-*.txt` 記述が存在しないため、改修3 の対象外。

**変更理由:** 削除対象を3拡張子へ拡張（改修1）したのに Iron Law / 完了条件が `session-history-*.txt` のままだと、設計内・スキル内で記述が矛盾し、実装・検証時に「`.txt` のみ削除すればよい」と誤解されうる。表現を整合させ、3拡張子削除が Iron Law / 完了条件としても正となるようにする（AC-010-1 の波及整合）。

### 6.1 Iron Law（fs-change-phase3 / fs-bugfix-phase3）

両スキルの Iron Law 行（`- **session-history-*.txt の確実な削除**: 検証完了後（PASS の場合）、…`）は**完全同一**であるため、共通の before→after として扱う。以下では参照のため両スキルそれぞれの before/after を併記するが、before は両スキルで同一文字列であり、after も両スキルで同一である（6.2 の完了条件と同様に「両スキル共通」の整合とする）。

**before（fs-change-phase3-final-check の Iron Law）:**
```markdown
- **session-history-*.txt の確実な削除**: 検証完了後（PASS の場合）、`.aide/tmp/session-history-*.txt` の全ファイルを必ず削除する。残存させると次回ワークフロー実行時に誤判定の原因となる
```

**after（fs-change-phase3-final-check の Iron Law）:**
```markdown
- **session-history 系（.txt/.png/.err）の確実な削除**: 検証完了後（PASS の場合）、`.aide/tmp/session-history-*.txt`・`.aide/tmp/session-history-*.png`・`.aide/tmp/session-history-*.err` の全ファイルを必ず削除する。加えて session-history 系以外の想定外残ファイルはユーザー確認の上で削除する。残存させると次回ワークフロー実行時に誤判定の原因となる
```

**before（fs-bugfix-phase3-final-check の Iron Law）:**
```markdown
- **session-history-*.txt の確実な削除**: 検証完了後（PASS の場合）、`.aide/tmp/session-history-*.txt` の全ファイルを必ず削除する。残存させると次回ワークフロー実行時に誤判定の原因となる
```

**after（fs-bugfix-phase3-final-check の Iron Law）:**
```markdown
- **session-history 系（.txt/.png/.err）の確実な削除**: 検証完了後（PASS の場合）、`.aide/tmp/session-history-*.txt`・`.aide/tmp/session-history-*.png`・`.aide/tmp/session-history-*.err` の全ファイルを必ず削除する。加えて session-history 系以外の想定外残ファイルはユーザー確認の上で削除する。残存させると次回ワークフロー実行時に誤判定の原因となる
```

### 6.2 完了条件（fs-change-phase3 / fs-bugfix-phase3）

両スキルの「## 完了条件」内 PASS 条件に同一表現がある。

**before（fs-change-phase3-final-check / fs-bugfix-phase3-final-check 共通）:**
```markdown
3. 一時ファイル（session-history-*.txt）が削除されている
```

**after（fs-change-phase3-final-check / fs-bugfix-phase3-final-check 共通）:**
```markdown
3. 一時ファイル（session-history-*.{txt,png,err}）が削除され、想定外残ファイルはユーザー確認の上で処理されている
```

### 6.3 改修3 の対応 網羅テーブル

| # | スキル | Iron Law 整合 | 完了条件整合 | 備考 |
|---|---|---|---|---|
| 1 | fs-bugfix-phase3-final-check | ○（6.1） | ○（6.2） | Iron Law 節・完了条件節あり |
| 2 | fs-change-phase3-final-check | ○（6.1） | ○（6.2） | Iron Law 節・完了条件節あり |
| 3 | fs-design-phase11-final-check | 対象外 | 対象外 | 該当する Iron Law/完了条件の txt 記述なし |
| 4 | fs-impl-phase7-final-check | 対象外 | 対象外 | 同上 |
| 5 | fs-planning-phase4-final-check | 対象外 | 対象外 | 同上 |
| 6 | fs-refactoring-phase7-final-check | 対象外 | 対象外 | 同上 |
| 7 | fs-reverse-phase6-final-check | 対象外 | 対象外 | 同上 |

## 7. AC-010-5 の担保（検証フローへの非影響）

本 REQ-C-010 のクリーンアップ範囲拡張（改修1）・想定外ファイル確認削除（改修2）・表現整合（改修3）は、いずれも**既存の検証フローの後段に位置するクリーンアップ処理への変更のみ**であり、検証判定結果に影響を与えない。設計上、以下を明記する。

- **Step 順序・位置づけの維持:** 全7スキルとも、署名検証・進捗ファイル更新は Step 1（`progress-final-checker` への委譲）で行われ、その PASS 後に Step 2「一時ファイルの削除」が実行される既存順序を維持する。本改修は Step 2 内に閉じており、Step 1 の検証ロジック（署名検証・進捗更新）には一切手を加えない。
- **判定結果への非影響:** 改修1（glob 拡張）・改修2（想定外ファイル確認削除）は Step 1 の PASS/FAIL 判定後の整理処理であり、削除対象の増減やユーザー確認の結果が `progress-final-checker` の判定や進捗ファイルのステータス更新を変えることはない。
- **FAIL 時には到達しない:** 既存仕様どおり Step 2 は Step 1 が PASS した場合の後段処理であり、FAIL 時はリセット・差し戻しへ分岐して Step 2 に至らない。本改修はこの分岐構造も変更しない。

これにより AC-010-5（既存の検証フローの判定結果に影響を与えず、検証 PASS 後の後段処理として行う既存位置づけを維持）を満たす。

## 8. インターフェース影響

- **なし。** 本改修は対象7スキル各 SKILL.md 内の「一時ファイルの削除」Step（および bugfix/change の Iron Law・完了条件）のテキスト記述変更のみであり、スキルの呼び出しシグネチャ・入力パラメータ・被参照関係に変更はない。
- final-check 系7スキルは step-history-writer を呼び出さない（delta-design-overview.md 2.1「呼び出し元なし（対象外）の 7 スキル」）ため、REQ-C-007（artifact_dir 引数追加）とも独立しており波及しない。
- screenshot-capture（N-1）・step-history-writer（C-1）・compliance-checker（C-2）の各設計とも独立して成立する。本改修は「生成される `.png`/`.err` を末尾で清掃する」受け皿としてのみそれらと連動する。

## 9. AC 対応サマリ

| AC | 充足箇所 |
|---|---|
| AC-010-1（`.png`/`.err` を削除対象に追加） | 改修1（4章）。bugfix/change は改修3（6章）で Iron Law/完了条件も整合 |
| AC-010-2（対象7スキル全てに同一適用） | 4.4 / 5.3 / 6.3 の網羅テーブル。task-orchestration で並列・全件適用 |
| AC-010-3（想定外ファイルの一覧提示・確認） | 改修2（5章 5.1 手順 1〜4） |
| AC-010-4（承認なら削除・残置なら残す） | 改修2（5章 5.1 手順 5。番号付き選択肢で判断尊重） |
| AC-010-5（検証フロー判定への非影響・後段位置づけ維持） | 7章 |
