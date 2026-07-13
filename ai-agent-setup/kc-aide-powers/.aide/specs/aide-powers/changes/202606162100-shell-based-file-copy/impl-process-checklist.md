# 工程チェック表

## 概要

| 項目 | 値 |
|---|---|
| 成果物種別 | 非プログラム（Markdown ドキュメントの編集） |
| テストフレームワーク | なし（手動検証） |
| 工程数/タスク | 4工程（実装 → 手動検証 → 設計準拠レビュー → コード品質レビュー） |

---

## D-001: `skills/using-aide-powers/SKILL.md` — 起動手順2のシェルコマンド化

| # | 工程 | 内容 | 完了条件 | 状態 |
|---|---|---|---|---|
| 1 | 実装 | SKILL.md の起動手順2セクションを delta-design.md「変更対象1」の after に書き換え | after の記述が SKILL.md に反映されている | ✅ done |
| 2 | 手動検証 | 書き換え後のセクションが期待通りの構造・内容か確認 | (a) PowerShell コマンド（Copy-Item, New-Item）が正しい構文で記載されている (b) bash コマンド（cp, mkdir -p, touch）が正しい構文で記載されている (c) version.json 比較ロジックが維持されている (d) 「AI はコピー対象を Read/Write してはならない」注意書きが含まれている (e) 手順2以外のセクション（手順1, 3, 4）に意図しない変更がない | ➖ skip |
| 3 | 設計準拠レビュー | delta-design.md「変更対象1」の after と SKILL.md の該当セクションを突き合わせ | after の全記述が SKILL.md に正確に反映されている（差分なし） | ✅ done |
| 4 | 品質レビュー | 記述の品質・一貫性チェック | (a) Windows/Linux コマンドが対で記載されている (b) コメント・説明文が明確 (c) 既存セクションとの文体・マークダウン書式が統一されている | ➖ skip |

---

## D-002: `skills/rules-distribute/SKILL.md` — ステップ2 global モードのシェルコマンド化

| # | 工程 | 内容 | 完了条件 | 状態 |
|---|---|---|---|---|
| 1 | 実装 | SKILL.md のステップ2「入力ソース」および「差分検知＆置き換え処理」セクションを delta-design.md「変更対象2」の after に書き換え | after の記述が SKILL.md に反映されている | ✅ done |
| 2 | 手動検証 | 書き換え後のセクションが期待通りの構造・内容か確認 | (a) 各プラットフォーム別シェルコマンドが正しい構文で記載されている (b) front-matter テンプレートが各プラットフォームの仕様と整合している (c) フラグ削除コマンド（Remove-Item / rm）が正しい (d) 「AI は Read してはならない」注意書きが含まれている (e) 「維持する部分（変更なし）」リストが含まれている (f) skill モード（deploy/cleanup）セクションに意図しない変更がない (g) AGENTS.md / GEMINI.md 追記ロジックに意図しない変更がない | ➖ skip |
| 3 | 設計準拠レビュー | delta-design.md「変更対象2」の after と SKILL.md の該当セクションを突き合わせ | after の全記述が SKILL.md に正確に反映されている（差分なし） | ✅ done |
| 4 | 品質レビュー | 記述の品質・一貫性チェック | (a) 全プラットフォーム（Kiro/Claude Code/Cursor/Copilot/Codex/OpenCode/Gemini）のコマンドが記載されている (b) Windows/Linux コマンドが対で記載されている (c) コードブロックの言語指定（powershell/bash）が正しい (d) 既存セクションとの文体・マークダウン書式が統一されている (e) front-matter のエスケープ（PowerShell バッククォート / bash printf）が正確 | ➖ skip |

---

## RT-1〜RT-5: 手動検証タスク（リグレッションテスト）

| # | タスクID | 確認内容 | 完了条件 | 状態 |
|---|---|---|---|---|
| 1 | RT-1 | skill モード（deploy/cleanup）が破損していないこと | 変更前後で skill モードセクションが同一 | ✅ done |
| 2 | RT-2 | version.json 比較ロジックが破損していないこと | 変更後の version 比較手順が delta-design.md の after と整合 | ✅ done |
| 3 | RT-3 | AGENTS.md / GEMINI.md 追記ロジックが破損していないこと | 変更前後で追記ロジックセクションが同一 | ✅ done |
| 4 | RT-4 | using-aide-powers 手順3以降が破損していないこと | 変更前後で手順3以降が同一 | ✅ done |
| 5 | RT-5 | セッション開始フロー全体が正常完了すること | setup.bat 再デプロイ後、新セッションで手順1〜4 が完了 | ✅ done |
