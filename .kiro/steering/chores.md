---
inclusion: fileMatch
fileMatchPattern: "*chore*"
---

# お手伝いリスト

## 概要

親が「やってほしいお手伝い」を登録し、子供がTOP画面の📋アイコンから一覧確認できる機能。

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `pages/chores.html` | お手伝いリスト画面（一覧＋admin登録フォーム） |
| `sql/create_chore_tasks_table.sql` | テーブル作成SQL |

## テーブル: chore_tasks

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID (PK) | 自動生成 |
| title | TEXT NOT NULL | お手伝い名 |
| description | TEXT | 詳細説明（任意） |
| points | INT (default 1) | 獲得ポイント |
| priority | INT (default 0) | 優先度（0=ふつう、1=大事、2=とても大事） |
| assign_to | TEXT (nullable) | 対象の子供名（nullなら全員向け） |
| status | TEXT (default 'active') | 状態: active / done / archived |
| done_by | TEXT | 完了した子供の名前 |
| done_at | TIMESTAMPTZ | 完了日時 |
| created_at | TIMESTAMPTZ | 作成日時 |

- RLS無効（他テーブルと同様）
- INDEX: `idx_chore_tasks_status` (status='active')

## 画面仕様

### 全ユーザー共通
- 「やること」「おわった」タブ切り替え
- やること: priority降順 → created_at昇順
- おわった: done_at降順
- ✓ボタンで完了マーク（URLパラメータ `?child=名前` で完了者記録）
- ひらがなモード: カタカナ→ひらがな変換トグル（localStorage `chore_hiragana` に保存）
  - kuroshiro + kuromoji辞書（CDN）によるブラウザ内完全変換（漢字・カタカナ→ひらがな）
  - 辞書は約3MB、初回ロード時のみ読み込み（「よみこみ中...」表示）
  - UIラベル（タブ名・空メッセージ等）もひらがな変換対象
- 子供フィルタ: `?child=名前` パラメータがある場合、assign_toが自分宛 or null のタスクのみ表示

### admin端末のみ
- 追加フォーム表示（タイトル・説明・ポイント・優先度・対象の子供）
- assign_to: 「みんな（全員）」or 特定の子供名を選択
- ✕ボタンで削除
- ↩ボタンで完了→アクティブに戻す
- admin端末では全タスク表示（子供フィルタなし）

### 優先度アイコン
- 0（ふつう）: 📌
- 1（大事）: ⭐
- 2（とても大事）: 🔥

## TOPページ連携

- `index.html` のh1内に📋アイコン（`pages/chores.html`へのリンク）

## 注意点

- `common.js` で `isAdmin` が既にグローバル定義されているため、chores.html内では再宣言しない
- 既存の `chore_types`（家事マスタ）や `chore_points`（ポイント履歴）とは別機能
  - `chore_types`: お手伝いポイント申請時の選択肢マスタ
  - `chore_tasks`: 親が今やってほしいタスクを都度登録するTodoリスト
- ひらがなモード: kuroshiro + kuromoji辞書によるブラウザ内漢字→ひらがな完全変換（UIラベル・タスク名・説明・名前全て変換）
- assign_toフィルタはuser端末のみ適用（admin端末では全タスク表示）
- kuroshiro辞書（約3MB）はひらがなモードON時のみ遅延ロード（CDN: jsdelivr）
- localStorage `chore_hiragana` にモード状態を保存（次回訪問時も維持）
