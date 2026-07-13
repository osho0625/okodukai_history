# 工程チェック表

## 成果物種別
非プログラム成果物（Markdownスキル定義ファイル）

## 工程構成
- implement: ファイルの作成/変更
- review: 設計準拠確認（目視）

※ テスト実行工程は不要（自動テストフレームワーク未導入: dev-environment.md §13）

---

## D-001: refactoring-verification-prompt.md 新規作成

| 工程 | チェック項目 | 状態 |
|---|---|---|
| implement | refactoring-verification-prompt.md をdelta-design.md §2に従いセクション1〜9で作成した | ✅ done |
| review | T-1: セクション構成（1〜9）が揃っている | ✅ done |
| review | T-2: プレースホルダーが7個定義されている | ✅ done |
| review | T-3: 外部振る舞い保持試験がメイン検証項目として定義されている | ✅ done |
| review | T-4: 3種類の試験テーブル（セーフティネット・外部振る舞い保持・リグレッション）が定義されている | ✅ done |

---

## D-002: SKILL.md 変更（Step 3 / 成果物テーブル / Integration）

| 工程 | チェック項目 | 状態 |
|---|---|---|
| implement | 成果物テーブルにverification-report.md行を追加した（delta-design.md §3.1） | ✅ done |
| implement | Step 3を「動作確認試験」に書き換えた（delta-design.md §3.2） | ✅ done |
| implement | Integrationセクションにサブエージェントプロンプト項目を追加した（delta-design.md §3.3） | ✅ done |
| review | T-5: Step 3のタイトル・処理フロー・完了条件・状態判定が差分設計通りである | ✅ done |
| review | T-6: 成果物テーブルにverification-report.mdが追加されている | ✅ done |
| review | T-7: Integrationセクションにrefactoring-verification-prompt.mdへの参照がある | ✅ done |

---

## D-003: program-structure.md 更新

| 工程 | チェック項目 | 状態 |
|---|---|---|
| implement | fs-refactoring-phase5-implセクションをdelta-design.md §5.1 afterに従い更新した | ✅ done |
| review | T-8: プロセス行が「Step3: 動作確認試験」になっている | ✅ done |
| review | T-8: 成果物行に`verification-report.md`が含まれている | ✅ done |
| review | T-8: プロンプトテンプレート行に`refactoring-verification-prompt.md`が含まれている | ✅ done |
