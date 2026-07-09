# 柱1 差分設計: 記述強化（全SKILL共通原則）

本ファイルは `fix-design.md` の分割ファイルである。柱1（記述強化・全SKILL共通原則）に該当する4ファイル（#1〜#4）の before→after→変更理由を記載する。

- 親ファイル: [fix-design.md](./fix-design.md)
- 対応する柱: 柱1（記述強化・全SKILL共通原則／最重要）
- 根拠: `bug-analysis.md`「最上位対策（全SKILL共通原則）」、`fix-plan.md`「柱1」

柱1の核心は次の3点を最上位原則として確立することである（`fix-plan.md` より）。

1. aide-powers の全ての SKILL（step-history-writer に限らず、フェーズスキル `fs-*` も、共通スキルも、全て）は、AI が内容を独自解釈して自己流で進めてはならない。
2. 必ず該当 SKILL を activate（Kiro IDE では `discloseContext`、他プラットフォームでは `Skill` / `activate_skill` 等のスキル起動機構）で有効化し、SKILL の記述に 100% 従って実行する。
3. 一度読んで内容を覚えたとしても、それを理由に activate を省略・自己流代替してはならない。activate は動作確認のためではなく、実行のたびに SKILL のルールを AI のコンテキストへ正確に再注入・適用するために必須である。

---

## 1. phase-skill-rules.md（正本）

対象ファイル: `skills/using-aide-powers/references/phase-skill-rules.md`

挿入位置: 冒頭の導入文（「AIの安易な判断でルールを逸脱することを禁止する。」の段落）と最初の区切り線 `---` の直後、既存の「## 前処理・後処理の絶対実行」セクションの**直前**に、新セクション「## 全SKILLの activate 必須・独自解釈禁止（最上位原則）」を挿入する。最上位原則であるため、既存の全セクションより前（筆頭）に置く。

### before

````markdown
これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。
緻密に計画されたプロセスのいずれかを省略・簡素化することは、後の不具合の元凶となる。
AIの安易な判断でルールを逸脱することを禁止する。

---

## 前処理・後処理の絶対実行
````

### after

````markdown
これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。
緻密に計画されたプロセスのいずれかを省略・簡素化することは、後の不具合の元凶となる。
AIの安易な判断でルールを逸脱することを禁止する。

---

## 全SKILLの activate 必須・独自解釈禁止（最上位原則）

これは aide-powers の全スキルに優先して適用される最上位の原則である。

aide-powers の全ての SKILL（`step-history-writer` のような共通スキルも、フェーズスキル `fs-*` も、その他のあらゆるスキルも、例外なく全て）は、AI が内容を独自解釈して自己流で進めてはならない。

スキルを実行するときは、必ず該当 SKILL を activate（Kiro IDE では `discloseContext`、Claude Code では `Skill`、他プラットフォームでは `activate_skill` 等、各プラットフォームのスキル起動機構）で有効化し、SKILL の記述に 100% 従って実行すること。SKILL に書かれていない手順を独自に補ったり、書かれている手順を省略・代替手段（`fs_write` 直書き等）に置き換えたりしてはならない。

**「覚えているから activate は不要」は誤りである。** 一度読んで内容を覚えたとしても、それを理由に activate を省略したり自己流で代替したりしてはならない。activate の目的は「動作を一度知ること」ではなく、**実行のたびに SKILL のルールを AI のコンテキストへ正確に再注入し、そのルールを忠実に適用すること**である。覚えた内容は時間経過・コンテキスト圧縮・自己流の解釈で劣化しうるため、正確性は毎回の activate によってのみ担保される。

AI が陥りがちな誤り（全て禁止）:
- 「このスキルの動作は分かっているから、activate せず自分で同じ処理をすればよい」
- 「前処理で1回 activate したから、以降の Step では activate しなくてよい」
- 「`fs_write` で同じ見た目のファイルを作れるから、スキルを通さなくてよい」

スキルを正確に activate して 100% 従って実行することが、履歴の自己流作成・証跡の捏造・工程の省略といった重大な不具合を未然に防ぐ唯一の方法である。

---

## 前処理・後処理の絶対実行
````

### 変更理由

`bug-analysis.md`「根本原因（不具合A・B 共通）」が特定したとおり、本不具合の単一の根本原因は「AIエージェントが、フェーズスキルの内容を一度読んだだけで『同じことを自分でやれば済む』と安易に判断し、スキルを正確に activate せず自己流で実行したこと」である。`fix-plan.md`「柱1（最重要・記述強化・全SKILL共通原則）」は、これに対する最上位対策として、この共通原則を正本 `phase-skill-rules.md` に記載することを指示している。`phase-skill-rules.md` は全7WF・全フェーズスキルに常時注入される最上位ルールであり、ここに記載することが最も波及効果が高い。不具合A（履歴の自己流作成）も不具合B（承認の捏造）も、この共通原則が守られていれば発生しなかったため、承認専用の個別対策は設けず本原則でカバーする（`bug-analysis.md`「最上位対策」）。最上位原則であるため既存セクションより前（筆頭）に配置する。文面追加のみで既存ルールの削除はしないため、振る舞いを壊すリスクは低い（`fix-plan.md`「副作用リスク」）。

---

## 2. version.json

対象ファイル: `skills/using-aide-powers/references/version.json`

変更位置: `rules.phase-skill-rules.md` エントリの `version` と `updated`。

### before

````json
{
  "_comment": "aide-powers ルール正本のバージョン情報。正本 global-rules.md / phase-skill-rules.md の本文を編集したら、必ず該当エントリの version を +1 し updated を更新すること。version を上げ忘れると配布先へ反映されない。本ファイルが正本（skills/using-aide-powers/references/version.json）。using-aide-powers の起動時手順がこの version と .aide/references/version.json の version を比較し、差分があれば .aide/references/ 配下を正本からごっそり置き換える。",
  "rules": {
    "global-rules.md": {
      "version": 2,
      "updated": "2026-06-02"
    },
    "phase-skill-rules.md": {
      "version": 1,
      "updated": "2026-06-02"
    }
  }
}
````

### after

````json
{
  "_comment": "aide-powers ルール正本のバージョン情報。正本 global-rules.md / phase-skill-rules.md の本文を編集したら、必ず該当エントリの version を +1 し updated を更新すること。version を上げ忘れると配布先へ反映されない。本ファイルが正本（skills/using-aide-powers/references/version.json）。using-aide-powers の起動時手順がこの version と .aide/references/version.json の version を比較し、差分があれば .aide/references/ 配下を正本からごっそり置き換える。",
  "rules": {
    "global-rules.md": {
      "version": 2,
      "updated": "2026-06-02"
    },
    "phase-skill-rules.md": {
      "version": 2,
      "updated": "2026-06-02"
    }
  }
}
````

### 変更理由

#1 で正本 `phase-skill-rules.md` の本文を編集する（全SKILL共通の最上位原則セクションを追加する）ため、`version.json` 冒頭の `_comment` が定める運用ルール「正本本文を編集したら必ず該当エントリの version を +1 し updated を更新する」に従い、`phase-skill-rules.md` の `version` を `1 → 2` に更新する。`updated` は同日付の編集であるため `2026-06-02` を維持する（実装日が異なる場合は実装日に更新する）。`fix-plan.md`「修正対象ファイル」#2 および「補足」が指示するとおり、version を更新しないと `using-aide-powers` 起動時の version 比較で差分が検知されず、`.aide/references/` への同期および各プラットフォームへの再配布が行われない。`phase-skill-rules.md` の編集（#1）と version 更新（#2）は必ずセットで実施する。`global-rules.md` の本文は本件で変更しないため、その version は据え置く。

---

## 3. using-aide-powers/SKILL.md（ハブ）

対象ファイル: `skills/using-aide-powers/SKILL.md`

挿入位置: 「## ルール」セクション内、「### フェーズスキル共通ルール」サブセクションの直後（「これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。」の行の直後）に、新サブセクション「### 全SKILLの activate 必須・独自解釈禁止（最上位原則）」を追加する。

### before

````markdown
### フェーズスキル共通ルール

フェーズスキル（`fs-*`）および aide-powers の共通スキル実行時は、必ず `.aide/references/phase-skill-rules.md` を読み、その指示に従うこと。
前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など、フェーズスキル実行に必須のルールが記載されている。

これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

---

## プラットフォーム適応
````

### after

````markdown
### フェーズスキル共通ルール

フェーズスキル（`fs-*`）および aide-powers の共通スキル実行時は、必ず `.aide/references/phase-skill-rules.md` を読み、その指示に従うこと。
前処理・後処理の絶対実行、フェーズ省略禁止、設計書なしの実装禁止など、フェーズスキル実行に必須のルールが記載されている。

これらのルールを守れないなら、aide-powers をそもそも使ってはいけない。

### 全SKILLの activate 必須・独自解釈禁止（最上位原則）

これは aide-powers の全スキルに優先して適用される最上位の原則である。

aide-powers の全ての SKILL（共通スキルも、フェーズスキル `fs-*` も、例外なく全て）は、AI が内容を独自解釈して自己流で進めてはならない。実行のたびに必ず該当 SKILL を activate（Kiro IDE では `discloseContext`、Claude Code では `Skill`、他プラットフォームでは `activate_skill` 等）で有効化し、SKILL の記述に 100% 従って実行すること。書かれていない手順を独自に補ったり、書かれている手順を省略・代替（`fs_write` 直書き等）に置き換えたりしてはならない。

**「覚えているから activate 不要」は誤りである。** 一度読んで内容を覚えたとしても、activate を省略・自己流代替してはならない。activate の目的は動作確認ではなく、実行のたびに SKILL のルールをコンテキストへ正確に再注入・適用することである（覚えた内容は時間経過・コンテキスト圧縮・自己流解釈で劣化しうる）。

詳細は `.aide/references/phase-skill-rules.md` の「全SKILLの activate 必須・独自解釈禁止（最上位原則）」を参照。

---

## プラットフォーム適応
````

### 変更理由

`fix-plan.md`「柱1」が指示するとおり、`using-aide-powers/SKILL.md` はセッション開始時に最初に読まれる起点ハブスキルであり、ここに全SKILL共通原則を記載することは波及効果が極めて高い。`bug-analysis.md`「修正の方向性と対象ファイル群」A-2 も「ハブスキルへの記載は波及効果が極めて高い」と明記している。既存の「### フェーズスキル共通ルール」と同じ「## ルール」セクション内に並置することで、ルールの一貫性を保ちつつ最上位原則を読者の目に入りやすくする。正本 `phase-skill-rules.md`（#1）と重複する内容だが、ハブスキルは正本本文をそのまま転記するのではなく要点を記載し、詳細は正本を参照させる構成とすることで、二重管理による乖離リスクを抑える。SKILL.md 本体への追記であり `global-rules.md` 正本本文は変更しないため、`global-rules.md` の version は更新しない（インターフェース影響サマリ参照）。文面追加のみで既存記述の削除はない。

---

## 4. step-history-writer/SKILL.md

対象ファイル: `skills/step-history-writer/SKILL.md`

挿入位置: 「## このファイルの目的（最重要・誤解禁止）」セクションの直後、「## 呼び出し元」セクションの**直前**に、新セクション「## 毎Step activate必須・自己流直書き禁止（厳守）」を挿入する。柱1の共通原則の「個別具体例」として、本スキル固有の禁止事項を明文強化する。

### before

````markdown
省いてよいのは「コード全文・ファイル全文」など極端に長い本文だけであって、やり取り自体を間引いてはならない。

## 呼び出し元

全7ワークフローの全フェーズスキル（final-check フェーズ含む）から、各 Step 完了時に呼び出される。
````

### after

````markdown
省いてよいのは「コード全文・ファイル全文」など極端に長い本文だけであって、やり取り自体を間引いてはならない。

## 毎Step activate必須・自己流直書き禁止（厳守）

本スキルは、各 Step 完了のたびに必ず activate（`discloseContext` / `Skill` / `activate_skill` 等）して実行すること。以下を厳守する。

- **毎 Step activate 必須:** 前処理・各 Step・後処理それぞれの完了時に、毎回本スキルを activate して履歴を書き出す。前処理で1回 activate したからといって、以降の Step で activate を省略してはならない。activate の目的は「書き方を知ること」ではなく、実行のたびに本スキルの転記ルール（会話履歴をそのまま転記する／要約・捏造禁止／step_id ごと1ファイル）をコンテキストへ再注入することである。
- **自己流 `fs_write` 直書きによる代替の禁止:** 本スキルを activate せずに、AI が記憶を頼りに `fs_write` で「それらしい履歴ファイル」を直接作成することを禁止する。出力先・ファイル名が決め打ち（`.aide/tmp/session-history-{skill_name}-{step_id}.txt`）であるため直書きでも同じ見た目のファイルを作れてしまうが、それは転記ルールが再注入されないまま生成された不正な履歴であり、要約・捏造・束ねの温床となる。
- **step_id ごと1ファイル厳守・束ね禁止:** 履歴ファイルは step_id ごとに必ず1ファイルずつ作成する。複数の Step（例: step1・step2・step3）を `step1-3.txt` のような1ファイルに束ねることを禁止する。1回の activate で書き出すのは、指定された単一の step_id の履歴のみである。
- **承認の転記:** ユーザー承認を履歴に記録するときは、オーケストレータ自身がユーザーと実際に行った対話（確認メッセージとユーザーの応答）をそのまま転記する。サブエージェントの「承認を得た」報告を、オーケストレータが確認していないまま承認として転記してはならない（承認の事実化＝捏造の禁止）。

これらは `.aide/references/phase-skill-rules.md`「全SKILLの activate 必須・独自解釈禁止（最上位原則）」の本スキルにおける個別具体例である。

## 呼び出し元

全7ワークフローの全フェーズスキル（final-check フェーズ含む）から、各 Step 完了時に呼び出される。
````

### 変更理由

`fix-plan.md`「柱1」末尾が指示するとおり「柱1の具体例として `skills/step-history-writer/SKILL.md` に、毎 Step activate 必須・自己流 `fs_write` 直書きによる代替禁止・step_id ごと1ファイル厳守・束ね禁止を明文強化する」ためである。`bug-analysis.md`「不具合A 関連」が指摘した2つの傍証—(1)「なぜ activate しなければならないか（ルール再注入が目的で毎回必須）」が書かれていないため AI が activate の目的を誤解した、(2) 出力先決め打ちのため直書きで同じ見た目のファイルが作れてしまった—に直接対応する文面を、本スキル本体に明記する。これにより、本スキルを読んだ AI が「内容を覚えたから直書きでよい」と錯覚することを防ぐ。承認の転記に関する一文は、不具合B（承認の捏造）が本スキルの転記ルール逸脱から連鎖した点（`bug-analysis.md`「A→B 連鎖」）を踏まえ、本スキル内で承認の事実化を明示的に禁じるものである。挿入位置を「## このファイルの目的（最重要・誤解禁止）」の直後とすることで、目的の説明と禁止事項を隣接させ、読者が活性化の理由と禁止事項を一続きで理解できるようにする。文面追加のみで既存 Process・記述ルールの削除はない。
