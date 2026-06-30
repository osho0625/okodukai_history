---
inclusion: fileMatch
fileMatchPattern: "*chore*"
---

# お手伝いリスト

## 概要

親が「やってほしいお手伝い」を登録し、子供がTOP画面の📋アイコンから一覧確認できる機能。
定型業務テンプレートからワンタップ追加も可能。

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `pages/chores.html` | お手伝いリスト画面（一覧＋admin登録＋定型業務管理） |
| `sql/create_chore_tasks_table.sql` | テーブル作成SQL |
| `sql/alter_game_settings_chore_templates.sql` | 定型業務カラム追加SQL |
| `dict/` | kuromoji辞書ファイル（ひらがな変換用、約15MB） |

## テーブル: chore_tasks

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID (PK) | 自動生成 |
| title | TEXT NOT NULL | お手伝い名 |
| description | TEXT | 詳細説明（任意、checklistがない場合の表示用） |
| checklist | JSONB (nullable) | チェックリスト `[{"text":"...", "checked": false}, ...]` |
| points | INT (default 1) | 獲得ポイント |
| priority | INT (default 0) | 優先度（0=ふつう、1=大事、2=とても大事） |
| assign_to | TEXT (nullable) | 対象の子供名（nullなら全員向け） |
| status | TEXT (default 'active') | 状態: active / done / archived |
| done_by | TEXT | 完了した子供の名前 |
| done_at | TIMESTAMPTZ | 完了日時 |
| created_at | TIMESTAMPTZ | 作成日時 |

- RLS無効（他テーブルと同様）
- INDEX: `idx_chore_tasks_status` (status='active')

## game_settings.chore_templates

定型業務テンプレート。JSONB配列:
```json
[{"title": "部屋の掃除", "checklist": ["ごみを拾う", "おもちゃをしまう"], "points": 5}, ...]
```

## 画面仕様

### 全ユーザー共通
- 「やること」「おわった」タブ切り替え
- やること: priority降順 → created_at昇順
- おわった: done_at降順
- ✓ボタンで完了マーク（URLパラメータ `?child=名前` で完了者記録）
- カードタップでチェックリスト展開
- チェックリスト: 各項目のチェックON/OFFでSupabase即時更新
- 全チェック完了→カード緑色化＋「ぜんぶおわった！」表示
- 進捗表示: ☑ 2/5 形式
- 子供別割り当て: カード左上に青バッジで名前を大きく表示
- 子供フィルタ: `?child=名前` パラメータがある場合、assign_toが自分宛 or null のタスクのみ表示

### ひらがなモード
- トグルON/OFF（localStorage `chore_hiragana` に保存）
- kuroshiro + kuromoji辞書によるブラウザ内漢字→ひらがな完全変換
- 辞書ファイルはリポジトリの `dict/` フォルダに配置（相対パス `../dict` で参照）
- カタカナ→ひらがな変換も実施（kuroshiro変換後に追加で適用）
- UIラベル（タブ名・空メッセージ等）もひらがな変換対象
- 辞書読み込み失敗時はフォールバック（カタカナ→ひらがなのみ、ラベル「ひらがな(かんたん)」）
- CDN版kuroshiroは `Kuroshiro.default` / `KuromojiAnalyzer.default` 形式のexport

### admin端末のみ
- 📂 定型業務から追加: テンプレート一覧をタップでワンタップ追加
- ➕ 自由に追加: タイトル・チェックリスト項目・ポイント・優先度・対象の子供
- ⚙️ 定型業務を管理: テンプレートの登録・削除
- チェックリストエディター: 「＋ チェック項目を追加」で動的追加、✕で削除
- assign_to: 「みんな（全員）」「いろは だけ」「かいせい だけ」「はるちか だけ」（ハードコード）
- ✕ボタンでタスク削除
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
- assign_toフィルタはuser端末のみ適用（admin端末では全タスク表示）
- kuroshiro辞書ファイルはリポジトリ直接配置（CDNからの読み込みは不安定だったため）
- localStorage `chore_hiragana` にモード状態を保存（次回訪問時も維持）
