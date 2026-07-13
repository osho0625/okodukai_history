# 差分設計: 大きいファイル全行読み出しルールの追記

## 設計方針

approach.md の方針に従い、本変更は「追加中心」で完結させる。

- **追加のみ**: `skills/using-aide-powers/references/global-rules.md`（正本）に、ファイル読み出し時の全行取得を義務付ける恒久ルールを独立した見出し付き新規セクションとして追記する。既存ルール（ツールマップ参照ルール・スキルの所在ルール・実行環境ルール等）の文言・順序には一切手を加えない。
- **OCP整合**: 既存資産の修正を伴わず、新規セクションの追記と version 値の更新のみで対処する（拡張に対して開き、修正に対して閉じる）。
- **配置位置の根拠**: ファイル読み取りの運用に関わる既存ルール「スキルの所在ルール」の直後（「実行環境ルール」の前）に配置する。これにより「ファイルをどう読むか」に関するルールが正本内で隣接してまとまり、全エージェントが一連のファイル読み取り運用ルールとして把握しやすくなる。
- **配布反映**: 正本追記のみでは AI 挙動に反映されないため、version.json の version を +1（5→6）し updated を更新する。本変更WFのスコープは正本（`global-rules.md`）への追記と version.json の +1 のみで完結する。`.aide/references/` への置き換え・rules-distribute による配布先（`.kiro/steering/aide-powers-global-rules.md`）の再生成は、version +1 をトリガーに**次回 using-aide-powers 起動時の起動時手順が自動的に行う**（本変更WFでは配布を手動実行しない）。配布先ファイルは rules-distribute が正本から再生成するため手動編集しない。

---

## 新規追加の設計

### global-rules.md への新規セクション追記

- **追記位置**: 「スキルの所在ルール」セクションの直後（「実行環境ルール」の前）。
- 直前セクション末尾（`注意: SKILL.md 本体だけは…` の行）と、その後の `---` 区切りに続けて、新セクション本体＋`---` 区切りを挿入する。挿入後の並びは「スキルの所在ルール → 大きいファイルを分割して全行読み出すルール → 実行環境ルール」となる。
- 既存スタイル（`## 見出し` の後に説明文、各ルール間は `---` で区切る）に合わせる。

#### before（追記位置の前後・該当箇所のみ）

```markdown
注意: SKILL.md 本体だけは、ファイルを直接読むのではなく各プラットフォームのスキル起動機構（discloseContext / Skill / activate_skill 等）で開くこと。付随プロンプト等の SKILL.md 以外のファイルはファイル読み取りツールで読む。

---

## 実行環境ルール
```

#### after（追記するセクションの完成形）

> 下記の「## 大きいファイルを分割して全行読み出すルール」セクション本体と、その直後の `---` 区切りを、「スキルの所在ルール」セクションの `---` と「## 実行環境ルール」の間に挿入する。

```markdown
注意: SKILL.md 本体だけは、ファイルを直接読むのではなく各プラットフォームのスキル起動機構（discloseContext / Skill / activate_skill 等）で開くこと。付随プロンプト等の SKILL.md 以外のファイルはファイル読み取りツールで読む。

---

## 大きいファイルを分割して全行読み出すルール

コード/ドキュメントファイルを読む際は read_file で全行読むこと。
10k文字を超える等で部分ロード（"partially loaded"）や AST 要約モードになった場合は、start_line/end_line を指定して複数回に分割し、ファイル末尾（レポート記載項目リスト・Integration 等の後半部分を含む）まで必ず全行取得してから判断すること。
read_code の要約モードに頼った読み落としを禁止する。

このルールはコード/ドキュメントファイルを読むあらゆる場面に適用される恒久・汎用ルールであり、全エージェント・全工程に適用される（フルレビュー等の特定作業専用ではない）。

読み落としによる誤検出（false positive）・見逃し（false negative）を出すことを禁止する。

---

## 実行環境ルール
```

#### 追記理由

- **位置の根拠**: 「ツールマップ参照ルール」「スキルの所在ルール」はいずれもファイル読み取り（read_file 等）の運用に関わるルールであり、本ルールも同種である。「スキルの所在ルール」直後に隣接配置することで、ファイル読み取り運用ルールが正本内でまとまり、参照性・整合性が高まる。既存セクションの順序・文言は変更しない（追加のみ）。
- **内容の根拠（REQ-C-001 / AC-002〜AC-004 充足）**: 追記本文に以下5点を明文として含める。
  1. コード/ドキュメントファイルを読む際は read_file で全行読む（AC-002）
  2. 部分ロード（"partially loaded"）・AST 要約モード時は start_line/end_line を指定して複数回に分割し、ファイル末尾まで必ず全行取得してから判断する（AC-002）
  3. read_code の要約モードに頼った読み落としを禁止する（AC-002）
  4. 適用対象は「コード/ドキュメントファイルを読むあらゆる場面（恒久・汎用、全エージェント・全工程）」である（AC-003）
  5. 読み落としによる誤検出（false positive）・見逃し（false negative）を禁止する（AC-004）
- **文言の参考**: 暫定先行実装 `.aide/task-plans/report-key-uniqueness/review-7-形式可読.md` 冒頭「読み出しルール（必須・最優先）」を参考にしつつ、レビュー専用の局所表現を汎用表現へ一般化した。

---

## 既存変更の設計

### version.json

references 一式のいずれかのファイル（本変更では global-rules.md）を変更したため、version を +1 し updated を更新する。

#### before

```json
  "version": 5,
  "updated": "2026-06-09"
```

#### after

```json
  "version": 6,
  "updated": "2026-06-11"
```

（`_comment` 行および JSON 全体構造は変更しない。version 値と updated 値の2行のみを変更する）

#### 変更理由

`version.json` の `_comment` に明記のとおり、references 配下のファイルを変更したら必ず version を +1 し updated を更新する必要がある。using-aide-powers の起動時手順が正本 version と `.aide/references/version.json` の version を比較し、正本 > .aide側 のときに `.aide/references/` 配下を正本からごっそり置き換える。すなわち version +1 が配布反映のトリガーであり、これを怠ると global-rules.md への追記が配布先へ反映されない（REQ-C-002）。

---

## インターフェース影響サマリ

- **コード変更なし**: 本変更はルールドキュメント（global-rules.md）への新規セクション追記と version.json の値更新のみであり、関数・クラス・API 等のシグネチャ変更は一切ない。実行可能コードへの変更は発生しない。
- **配布チェーン経由の波及（再生成であり手動編集ではない）**: version +1 をトリガーに、using-aide-powers 起動時手順が `.aide/references/global-rules.md` と `.aide/references/version.json` を正本から置き換え、rules-distribute が正本（`.aide/references/global-rules.md`）を入力として配布先 `.kiro/steering/aide-powers-global-rules.md` を再生成する。これらの配布先ファイルは rules-distribute により自動再生成されるため、本差分設計では before→after の対象としない（手動編集禁止）。配布（`.aide/references` 置き換え + `.kiro/steering` 再生成）は version +1 をトリガーに次回 using-aide-powers 起動時に自動実行されるため、本変更WFの実装タスクには含めない。

---

## 更新が必要な設計資料

なし（メタ開発のルールドキュメント変更。doc-index 登録対象の設計書への波及なし）。

- 本リポジトリはメタ開発であり、object-design-*.md / gui-design.md / program-structure.md / infra-interface-design.md / user-requirements.md は存在しない（dev-environment.md §14）。
- 変更対象は global-rules 正本（ルールドキュメント）と version.json のみで、doc-index.md に登録された設計書への内容波及はない。
