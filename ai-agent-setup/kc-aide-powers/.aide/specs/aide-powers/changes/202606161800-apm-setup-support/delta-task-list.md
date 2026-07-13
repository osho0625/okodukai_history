# 差分タスクリスト（バグ修正）

## 対象バグ修正
`apm run setup-kiro-win` 実行時に setup-local.bat のエンコーディング破損により exit code 255 で失敗する問題

## 対策種別
根本対策

## 参照設計書
- fix-design.md: `.aide/specs/aide-powers/changes/202606161800-apm-setup-support/fix-design.md`
- fix-plan.md: `.aide/specs/aide-powers/changes/202606161800-apm-setup-support/fix-plan.md`

---

## 依存関係グラフ

```
B-001 (setup-local.bat 再作成) ─┐
B-002 (.gitattributes 新規作成) ─┼─→ B-004 (リグレッションテスト)
B-003 (dev-environment.md 更新) ─┘
```

- B-001, B-002, B-003 は相互に独立（並列実行可能）
- B-004 は B-001〜B-003 の全完了後に実行

---

## Wave 構成

### Wave 1（並列実行可能: B-001, B-002, B-003）

| タスクID | タスク名 | 依存先 |
|----------|----------|--------|
| B-001 | setup-local.bat を UTF-8 + chcp 65001 で全体再作成 | なし |
| B-002 | .gitattributes の新規作成 | なし |
| B-003 | dev-environment.md §5.1 エンコーディング規約更新 | なし |

### Wave 2（B-001〜B-003 完了後）

| タスクID | タスク名 | 依存先 |
|----------|----------|--------|
| B-004 | リグレッションテスト手順の文書化 | B-001, B-002, B-003 |

---

## タスク詳細

### B-001: setup-local.bat を UTF-8 + chcp 65001 で全体再作成

| 項目 | 内容 |
|------|------|
| 対象ファイル | `setup-local.bat` |
| テストファイル | N/A（手動テスト） |
| 操作 | 修正（全体再作成） |
| 設計参照 | fix-design.md §差分設計 → 1. setup-local.bat |
| 変更概要 | ファイル全体を UTF-8（BOM なし）+ CRLF で再作成。`@echo off` の直後に `chcp 65001 >nul` を追加。文字化けした全日本語テキストを正しい UTF-8 テキストに復元。ロジック変更なし |
| 不変条件 | 引数インターフェース（第1引数: TARGET_DIR、第2引数: メニュー番号）は維持。メニュー番号 0〜4 は維持。分岐・コピー処理のロジックは一切変更しない |
| テスト観点 | (1) `apm run setup-kiro-win` が exit code 0 で正常終了すること (2) 日本語メッセージが文字化けなく表示されること（「ローカルセットアップ」「コピー中」「完了」等） (3) cmd.exe から `setup-local.bat . 1` を直接実行して正常終了すること |

### B-002: .gitattributes の新規作成

| 項目 | 内容 |
|------|------|
| 対象ファイル | `.gitattributes`（新規） |
| テストファイル | N/A（手動テスト） |
| 操作 | 新規作成 |
| 設計参照 | fix-design.md §差分設計 → 2. .gitattributes |
| 変更概要 | プロジェクトルートに `.gitattributes` を新規作成。`*.bat -text diff` を設定し、git による自動改行変換を防止する |
| 不変条件 | 既存ファイル（setup.bat 等）の git 管理状態に悪影響を与えないこと |
| テスト観点 | (1) `git status` で setup.bat に意図しない変更が表示されないこと (2) `git check-attr text -- setup-local.bat` で `unset` が返ること |

### B-003: dev-environment.md §5.1 エンコーディング規約更新

| 項目 | 内容 |
|------|------|
| 対象ファイル | `.aide/specs/aide-powers/dev-environment.md` |
| テストファイル | N/A（手動テスト） |
| 操作 | 修正（2箇所） |
| 設計参照 | fix-design.md §差分設計 → 3. dev-environment.md §5.1 |
| 変更概要 | §5.1 のテーブル行を「Shift_JIS（CP932）」→「UTF-8（BOM なし）」に変更し備考を更新。§5.1 下部の補足文を UTF-8 + chcp 65001 の説明に変更 |
| 不変条件 | §5.1 以外のセクションは変更しない。§5.2 の改行コード規約（bat は CRLF）は維持 |
| テスト観点 | (1) 変更後の記述が fix-design.md の after と一致すること (2) §5.2 以降の内容が変更されていないこと |

### B-004: リグレッションテスト手順の文書化

| 項目 | 内容 |
|------|------|
| 対象ファイル | `.aide/specs/aide-powers/changes/202606161800-apm-setup-support/regression-test-results.md`（新規） |
| テストファイル | N/A（手動テスト） |
| 操作 | 新規作成 |
| 設計参照 | fix-design.md §リグレッションテスト設計（テスト1〜テスト6） |
| 変更概要 | fix-design.md に定義された6件のリグレッションテスト（テスト1: バグ再現テスト再実行、テスト2: 日本語メッセージ表示確認、テスト3: ファイルコピー完了確認、テスト4: cmd.exe直接実行確認、テスト5: setup.bat リグレッション確認、テスト6: git clone後エンコーディング保全確認）の手順書と結果記録テンプレートを作成する |
| 不変条件 | テスト内容は fix-design.md の定義から逸脱しない |
| テスト観点 | (1) 6件全テストの手順・期待結果・判定基準が fix-design.md と整合していること (2) 結果記録欄（実施日・実施者・結果・備考）が各テストに存在すること |

---

## 更新が必要な設計資料（fix-design.md より）

| 資料 | 更新内容 | 対応タスク |
|------|----------|-----------|
| `dev-environment.md` §5.1 | bat エンコーディング規約を UTF-8 + chcp 65001 に変更 | B-003 |
| `program-structure.md` | ルート直下に `.gitattributes` を追記。配布されないファイルテーブルに追記 | B-002 実装後、doc-sync で対応 |

---

Docs: .aide/specs/aide-powers/changes/202606161800-apm-setup-support
