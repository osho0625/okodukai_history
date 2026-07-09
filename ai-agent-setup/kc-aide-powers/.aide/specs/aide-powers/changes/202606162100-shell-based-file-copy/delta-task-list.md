# 差分タスクリスト

## 概要

| 項目 | 値 |
|---|---|
| 変更名 | shell-based-file-copy |
| 変更種別 | 変更（既存スキル定義の振る舞い変更） |
| 成果物種別 | 非プログラム（Markdown ドキュメントの編集） |
| テストフレームワーク | なし（dev-environment.md §7: 手動検証） |
| 実装タスク数 | 2 |
| 手動検証タスク数 | 5 |

---

## 依存関係グラフ

```
D-001: using-aide-powers/SKILL.md 起動手順2
    ↓ （D-001 の変更結果 .rules-updated フラグを D-002 が参照）
D-002: rules-distribute/SKILL.md ステップ2 global モード
```

D-001 → D-002 の順序で実装する。

---

## 実装タスク

### D-001: `skills/using-aide-powers/SKILL.md` — 起動手順2のシェルコマンド化

| 項目 | 内容 |
|---|---|
| 対象ファイル | `skills/using-aide-powers/SKILL.md` |
| 変更セクション | 起動手順2「references 配置（version 比較による更新チェック）」 |
| 変更内容 | Read→Write 方式のコピー手順をシェルコマンド（Copy-Item / cp）方式に書き換え |
| 依存先 | なし（最初に実装） |
| 設計参照 | delta-design.md「変更対象1」の before → after |

**変更ポイント:**
- 「不足があれば正本から全ファイルをコピーする」の記述を削除
- version 不一致/ファイル不足時のコピー処理を Windows（PowerShell）と Linux/Mac（bash）のシェルコマンドに置き換え
- `.rules-updated` フラグ作成もシェルコマンド（`New-Item` / `touch`）に変更
- 「⚠️ AI はコピー対象ファイルの内容を Read/Write してはならない」の注意書きを追加
- version 一致判定条件に「かつファイルが全て揃っている」を追加

---

### D-002: `skills/rules-distribute/SKILL.md` — ステップ2 global モードのシェルコマンド化

| 項目 | 内容 |
|---|---|
| 対象ファイル | `skills/rules-distribute/SKILL.md` |
| 変更セクション | ステップ2: global モード「入力ソース」および「差分検知＆置き換え処理」 |
| 変更内容 | Read→Write 方式の配布手順をシェルコマンド（front-matter 結合 + コピー）方式に書き換え |
| 依存先 | D-001（D-001 が `.rules-updated` フラグを作成し、D-002 がそれを参照する） |
| 設計参照 | delta-design.md「変更対象2」の before → after |

**変更ポイント:**
- 「入力ソース」セクション: 「両ファイルを Read ツールで全文読み込み」→「AI はこれらのファイルを Read で読み込まない。シェルコマンドで結合」に変更
- 「差分検知＆置き換え処理」セクション手順3: Write ツール → 各プラットフォーム別シェルコマンドに変更
  - front-matter 付き: Kiro IDE/CLI, Claude Code, Cursor, GitHub Copilot
  - front-matter なし（単純コピー）: Codex, OpenCode, Gemini CLI
- 手順4: フラグ削除を `Remove-Item` / `rm` シェルコマンドに変更
- 「⚠️ AI は `.aide/references/global-rules.md` / `phase-skill-rules.md` の内容を Read してはならない」の注意書きを追加
- 「維持する部分（変更なし）」リストを追加

---

## 手動検証タスク（リグレッションテスト）

テストフレームワークが存在しないため（dev-environment.md §7）、以下は全て手動検証で実施する。

### RT-1: rules-distribute skill モード（deploy/cleanup）の正常動作確認

| 項目 | 内容 |
|---|---|
| 確認対象 | `skills/rules-distribute/SKILL.md` の skill:deploy / skill:cleanup モード |
| 確認内容 | D-002 の書き換えにより、skill モード部分の記述が破損していないこと |
| 確認方法 | 変更後の SKILL.md を目視確認し、skill モードセクションが before 版と同一であることを検証 |
| 依存先 | D-002 完了後 |

### RT-2: version.json 比較ロジックの正常動作確認

| 項目 | 内容 |
|---|---|
| 確認対象 | `skills/using-aide-powers/SKILL.md` の起動手順2（version 比較部分） |
| 確認内容 | D-001 の書き換えにより、version.json の Read と比較ロジックの記述が破損していないこと |
| 確認方法 | 変更後の SKILL.md を目視確認し、version 比較手順が delta-design.md の after と整合することを検証 |
| 依存先 | D-001 完了後 |

### RT-3: AGENTS.md / GEMINI.md 参照行追記ロジックの正常動作確認

| 項目 | 内容 |
|---|---|
| 確認対象 | `skills/rules-distribute/SKILL.md` の参照行追記ロジック |
| 確認内容 | D-002 の書き換えにより、AGENTS.md / GEMINI.md への追記ロジックが破損していないこと |
| 確認方法 | 変更後の SKILL.md を目視確認し、追記ロジックセクションが before 版と同一であることを検証 |
| 依存先 | D-002 完了後 |

### RT-4: using-aide-powers 手順3以降の正常動作確認

| 項目 | 内容 |
|---|---|
| 確認対象 | `skills/using-aide-powers/SKILL.md` の手順3（rules-distribute 呼び出し）以降 |
| 確認内容 | D-001 の書き換えにより、手順3以降の記述に意図しない影響が出ていないこと |
| 確認方法 | 変更後の SKILL.md を目視確認し、手順3以降が before 版と同一であることを検証 |
| 依存先 | D-001 完了後 |

### RT-5: セッション開始フロー全体の正常動作確認

| 項目 | 内容 |
|---|---|
| 確認対象 | ブートストラップ → using-aide-powers activate → 手順1〜4 の全体フロー |
| 確認内容 | D-001 + D-002 の変更後、セッション開始フロー全体が正常に一連で完了すること |
| 確認方法 | setup.bat で再デプロイ後、新セッションを開始し、using-aide-powers の手順1〜4 が正常に完了することを確認 |
| 依存先 | D-001, D-002 両方完了後 |

---

## 網羅性チェック

| delta-design.md の変更項目 | タスク |
|---|---|
| 変更対象1: using-aide-powers/SKILL.md 起動手順2 | D-001 ✅ |
| 変更対象2: rules-distribute/SKILL.md ステップ2 global モード | D-002 ✅ |
| skill モード（deploy/cleanup）変更なし | RT-1 で破損なし確認 ✅ |
| version.json 比較ロジック維持 | RT-2 で破損なし確認 ✅ |
| AGENTS.md / GEMINI.md 追記ロジック維持 | RT-3 で破損なし確認 ✅ |
| 手順3以降（rules-distribute 呼び出し等）維持 | RT-4 で破損なし確認 ✅ |
| セッション開始フロー全体の連続性 | RT-5 で確認 ✅ |

**結果: delta-design.md の全変更項目がタスクリストに反映されている。**

---

## 実行順序まとめ

```
1. D-001（using-aide-powers/SKILL.md 起動手順2）
2. RT-2（version.json 比較ロジック確認）
3. RT-4（手順3以降の確認）
4. D-002（rules-distribute/SKILL.md ステップ2 global モード）
5. RT-1（skill モード確認）
6. RT-3（AGENTS.md/GEMINI.md 追記ロジック確認）
7. RT-5（セッション開始フロー全体確認）
```
