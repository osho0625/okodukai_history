# 差分タスクリスト

## タスク一覧

| # | タスク | 対象ファイル | 依存 | 状態 |
|---|---|---|---|---|
| T1 | apm.yml の repository フィールド更新 | apm.yml | なし | ⬜ |
| T2 | README.md のURL・パス参照更新 | README.md | なし | ⬜ |
| T3 | docs/02-getting-started.md のURL・パス参照更新 | docs/02-getting-started.md | なし | ⬜ |
| T4 | dev-environment.md §8.3/§8.4 リモート構成更新 | .aide/specs/aide-powers/dev-environment.md | なし | ⬜ |
| T5 | docs-dev/06-execution-units.md ルート表記更新 | docs-dev/01-system-platform/06-execution-units.md | なし | ⬜ |
| T6 | 残存チェック（grep で旧パターンが残っていないことを確認） | 全ファイル | T1-T5 | ⬜ |

## タスク詳細

### T1: apm.yml の repository フィールド更新
- 成果物種別: 非プログラム（YAML設定ファイル）
- 設計参照: delta-design.md 変更1
- 置換: `http://10.110.47.117/takashi/aide-powers` → `http://10.110.47.117/kc-apm/kc-aide-powers`

### T2: README.md のURL・パス参照更新
- 成果物種別: 非プログラム（Markdownドキュメント）
- 設計参照: delta-design.md 変更2
- 置換パターン:
  - `http://10.110.47.117/takashi/aide-powers` → `http://10.110.47.117/kc-apm/kc-aide-powers`
  - `apm_modules\\takashi\\aide-powers\\` → `apm_modules\\kc-apm\\kc-aide-powers\\`
  - `apm_modules/takashi/aide-powers/` → `apm_modules/kc-apm/kc-aide-powers/`

### T3: docs/02-getting-started.md のURL・パス参照更新
- 成果物種別: 非プログラム（Markdownドキュメント）
- 設計参照: delta-design.md 変更3
- 置換パターン: T2 と同じ

### T4: dev-environment.md §8.3/§8.4 リモート構成更新
- 成果物種別: 非プログラム（Markdownドキュメント）
- 設計参照: delta-design.md 変更4
- 内容: 2系統→単一リポジトリ運用への書き換え（public 削除反映含む）

### T5: docs-dev/06-execution-units.md ルート表記更新
- 成果物種別: 非プログラム（Markdownドキュメント）
- 設計参照: delta-design.md 変更5
- 置換: `aide-claude/` → `kc-aide-powers/`（リポジトリルート表記）

### T6: 残存チェック
- 成果物種別: 検証タスク
- 設計参照: approach.md 方針「置換完了後に再度 grep で残存チェック」
- 手順:
  1. grep で `takashi/aide-powers` が残っていないこと確認（スコープ外ファイル除く）
  2. grep で `takashi/aide-claude.git` が残っていないこと確認（スコープ外ファイル除く）
  3. grep で `apm_modules/takashi/` が残っていないこと確認（スコープ外ファイル除く）
- 受入基準: 上記3パターンがスコープ内ファイルに残存しないこと
