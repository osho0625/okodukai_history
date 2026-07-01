---
inclusion: fileMatch
fileMatchPattern: "*chore*"
---

# お手伝いリスト

## 概要

親が「やってほしいお手伝い」を登録し、子供がTOP画面の📋アイコンから一覧確認できる機能。
定型業務テンプレートからワンタップ追加、毎朝自動追加、チェックリスト管理、完了→ポイント承認フローを備える。

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `pages/chores.html` | お手伝いリスト画面（一覧＋admin登録＋定型業務管理） |
| `sql/create_chore_tasks_table.sql` | テーブル作成SQL |
| `sql/alter_game_settings_chore_templates.sql` | 定型業務カラム追加SQL |
| `scripts/auto-chore-tasks.js` | 毎朝自動追加スクリプト（GitHub Actions cron） |
| `.github/workflows/auto-chore-tasks.yml` | cron設定（毎日9時JST） |
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
[{"title": "部屋の掃除", "checklist": ["ごみを拾う", "おもちゃをしまう"], "points": 5, "assign_to": "かいせい", "auto_add": true}, ...]
```

フィールド:
- `title`: テンプレート名
- `checklist`: チェックリスト項目（文字列配列、nullable）
- `points`: ポイント数
- `assign_to`: 誰専用（nullable、null=全員）
- `auto_add`: 毎日自動追加フラグ

## 完了→ポイントフロー

1. 全チェック完了 or ✓ボタン → 「🎉 ぜんぶおわった？」モーダル表示
2. 子供の名前（いろは/かいせい/はるちか）を選択
3. `chore_points` に pending で挿入（ポイント承認待ち）
4. タスクを `status: 'done'` に移動（「おわった」タブ表示）
5. Discord通知:「✅ 〇〇が「△△」をやりました！（Xpt承認待ち）」
6. admin承認（TOP画面 or child.html）→ ポイント確定＋doneタスク自動削除

## 画面仕様

### 全ユーザー共通
- 「やること」「おわった」タブ切り替え
- やること: priority降順 → created_at昇順
- おわった: done_at降順（承認されたら自動削除）
- カードタップでチェックリスト展開（展開状態はチェック操作で閉じない）
- チェックリスト: 各項目のチェックON/OFFでSupabase即時更新
  - `<label for="id">`パターンで文字クリックでもチェック可能
  - `checkLock`で連打防止
  - done状態のタスクはチェック操作不可
- 全チェック完了→カード緑色化＋「✅ ぜんぶおわった！」→完了モーダル自動表示
- 進捗表示: ☑ 2/5 形式
- チェックリストなしタスク: ✓ボタン表示（タップで完了モーダル）
- 子供別割り当て: カード上部に青インラインバッジで名前表示
- 子供フィルタ: `?child=名前` パラメータでassign_toが自分宛 or null のタスクのみ表示
- 重複追加防止: 同タイトルのactiveタスクがあれば追加拒否

### ひらがなモード
- トグルON/OFF（localStorage `chore_hiragana` に保存）
- kuroshiro + kuromoji辞書によるブラウザ内漢字→ひらがな完全変換
- 辞書ファイルはリポジトリの `dict/` フォルダに配置（相対パス `../dict` で参照）
- カタカナ→ひらがな変換も実施（kuroshiro変換後に追加でregex適用）
- UIラベル（タブ名・空メッセージ等）もひらがな変換対象
- 辞書読み込み失敗時はフォールバック（カタカナ→ひらがなのみ、ラベル「ひらがな(かんたん)」）
- CDN版kuroshiroは `Kuroshiro.default` / `KuromojiAnalyzer.default` 形式のexport

### admin端末のみ
- 📂 定型業務から追加: テンプレート一覧をタップでワンタップ追加
- ➕ 自由に追加: タイトル・チェックリスト項目・ポイント・優先度・対象の子供
- ⚙️ 定型業務を管理:
  - テンプレートの登録・編集・削除・複製
  - 編集: タイトル・チェックリスト・ポイント・assign_to・auto_add
  - 複製: 確認ダイアログ→「（コピー）」付きで追加→即編集モード
  - 🔄 毎日自動で追加する チェックボックス
- assign_to: 「みんな（全員）」「いろは だけ」「かいせい だけ」「はるちか だけ」（ハードコード）
- ✕ボタンでタスク削除
- ↩ボタンで完了→アクティブに戻す（対応するpending chore_pointsも1件削除＋チェックリストリセット）

### 完了モーダル
- 二重実行防止（overlay.active チェック）
- 子供ボタンは大きく表示（押し間違い防止）
- 「まだおわってない」→最後のチェック取り消し（チェックリスト経由の場合のみ）
- childDataがDB上に見つからない場合はalertで中断

### 優先度アイコン
- 0（ふつう）: 📌
- 1（大事）: ⭐
- 2（とても大事）: 🔥

## 自動追加（GitHub Actions cron）

- `.github/workflows/auto-chore-tasks.yml`: 毎日AM9:00 JST (UTC 0:00)
- `scripts/auto-chore-tasks.js`: `game_settings.chore_templates`から`auto_add: true`のものを取得し、同title+同assign_toのactiveタスクが無ければ自動insert

## TOPページ連携

- `index.html` のh1内に📋アイコン（`pages/chores.html`へのリンク）
- 承認処理（`approveFromTop` in index.html, `approvePoint` in child.html）で承認後にchore_tasksのdoneタスクを1件削除

## 注意点

- `common.js` で `isAdmin` が既にグローバル定義されているため、chores.html内では再宣言しない
- 既存の `chore_types`（家事マスタ）や `chore_points`（ポイント履歴）とは別機能
  - `chore_types`: お手伝いポイント申請時の選択肢マスタ（child.htmlから直接報告）
  - `chore_tasks`: 親が今やってほしいタスクを都度登録するTodoリスト（chores.html）
- assign_toフィルタはuser端末のみ適用（admin端末では全タスク表示）
- kuroshiro辞書ファイルはリポジトリ直接配置（CDNからの読み込みは不安定だったため）
- localStorage `chore_hiragana` にモード状態を保存（次回訪問時も維持）
- チェック状態はSupabase保存なので端末間で共有される
