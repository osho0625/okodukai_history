---
inclusion: fileMatch
fileMatchPattern: "*family-notes*,*family_notes*"
---

# 家族メモ帳（family-notes）

## 概要

家族共有のメモ帳＋ドキュメント閲覧機能。
親専用の管理者メモ・ドキュメント管理タブと、全員アクセス可能な通常メモタブを持つ。

## ファイル構成

- `pages/family-notes.html` — メモ帳画面（3タブ: メモ / 🔒管理者メモ / ドキュメント）
- `sql/create_family_notes_table.sql` — family_notes テーブル定義
- `sql/alter_game_settings_shared_docs.sql` — game_settings.shared_docs カラム追加
- `.kiro/specs/family-notes/docs/` — ドキュメント用マークダウンファイル置き場
- `.kiro/specs/family-notes/docs/index.json` — ドキュメント一覧定義

## DBテーブル

### family_notes（メモ）
- id: UUID PK (gen_random_uuid)
- title: TEXT NOT NULL DEFAULT ''
- content: TEXT NOT NULL DEFAULT ''
- author: TEXT NOT NULL（作成者名）
- is_admin: BOOLEAN NOT NULL DEFAULT false（管理者メモフラグ）
- shared: BOOLEAN NOT NULL DEFAULT false（管理者メモを一般に公開するか）
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- INDEX: idx_family_notes_is_admin (is_admin)
- INDEX: idx_family_notes_shared (shared) WHERE shared = true
- RLS無効

### game_settings 拡張カラム
- shared_docs: JSONB DEFAULT '[]' — 公開中ドキュメントのファイル名配列（例: `["contacts.md","outdoor-parks.md"]`）

## 画面構成

### タブ
1. **メモ** — 全ユーザーがアクセス可能。通常メモの一覧・作成・編集・削除
2. **🔒 管理者メモ** — admin端末のみ表示。is_admin=trueのメモを管理。「公開する」チェックでuser端末にも表示
3. **ドキュメント** — admin端末のみ表示（ただし公開されたドキュメントがあればuser端末にも表示）

### 権限制御
- admin端末: 全タブ表示、全メモ編集可能、ドキュメント公開/非公開切り替え
- user端末: メモタブのみ表示（通常メモの作成・編集・削除）+ 公開された管理者メモは読み取り専用 + 公開ドキュメントの閲覧

### メモエディタ
- タイトル + テキストエリア（プレーンテキスト）
- 管理者メモの場合「👀 みんなに公開する」チェックボックス表示
- 保存/削除/戻る

### ドキュメント機能
- `.kiro/specs/family-notes/docs/index.json` からファイル一覧を読み込み
- マークダウンファイルを `marked.js` でレンダリング表示
- admin端末: 各ドキュメントに👀/🔒トグルボタン（公開/非公開切り替え）
- 公開状態は `game_settings.shared_docs` (JSONB配列) に保存

## ドキュメント追加手順

1. `.kiro/specs/family-notes/docs/` にマークダウンファイルを作成
2. `.kiro/specs/family-notes/docs/index.json` にエントリ追加:
   ```json
   { "title": "表示タイトル", "file": "ファイル名.md" }
   ```
3. デプロイ後、admin画面のドキュメントタブから公開設定

## index.json の現在の内容

```json
[
  { "title": "連絡先・個人情報", "file": "contacts.md" },
  { "title": "アスレチック・公園まとめ", "file": "outdoor-parks.md" },
  { "title": "おでかけスポットまとめ", "file": "outing-spots.md" },
  { "title": "🗻 箱根旅行計画", "file": "hakone-trip-plan.md" },
  { "title": "八景島シーパラダイス", "file": "hakkeijima-seaparadise.md" },
  { "title": "子供の自立心・育成ロードマップ", "file": "child-independence-roadmap.md" },
  { "title": "🎮 Scratchでゲームをつくろう！", "file": "scratch-guide.md" },
  { "title": "🪀 けん玉ロードマップ", "file": "kendama-roadmap.md" },
  { "title": "🪀 けん玉チャレンジ！", "file": "kendama-kids.md" },
  { "title": "💪 筋トレマイルストーン", "file": "bodymaking-plan.md" }
]
```

## localStorage キー

| キー | 用途 |
|------|------|
| family_note_author | メモ作成者名（URLパラメータ or localStorage） |

## 技術メモ

- Supabaseクライアントは `common.js` の共通 `client` を使用
- マークダウン表示に `marked.js`（CDN）を使用
- ドキュメントファイルはキャッシュバスティング付きfetch（`?t=Date.now()`）
- admin判定は `common.js` の `isAdmin` グローバル変数
