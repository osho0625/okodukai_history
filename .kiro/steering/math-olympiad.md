---
inclusion: fileMatch
fileMatchPattern: "*math*,*olympiad*"
---

# 算数オリンピック + 算数バトル

## ファイル構成

- `pages/math-olympiad.html` — 算数オリンピック（思考力チャレンジ）
- `pages/math-battle.html` — 算数バトル
- `data/math-olympiad-grade1.json` — 算数オリンピック問題データ（小1）
- `data/math-olympiad-grade2.json` — 算数オリンピック問題データ（小2）
- `data/math-olympiad-grade3.json` — 算数オリンピック問題データ（小3）
- `data/math-olympiad-grade4.json` — 算数オリンピック問題データ（小4）
- `data/math-olympiad-grade5.json` — 算数オリンピック問題データ（小5）
- `data/math-olympiad-grade6.json` — 算数オリンピック問題データ（小6）
- `sql/math_olympiad_answers.sql` — 算数オリンピックテーブルマイグレーション
- `sql/create_math_battle_tables.sql` — 算数バトルテーブルマイグレーション
- `sql/alter_math_olympiad_admin.sql` — 算数オリンピック管理者ALTER
- `sql/alter_math_battle_disputes.sql` — 算数バトル異議ALTER
- `sql/alter_math_battle_passcode.sql` — 算数バトルパスコードALTER

## 算数オリンピック（pages/math-olympiad.html）

- 思考力育成アプリ。算数オリンピック風の問題を1問ずつ提示
- 単一HTML内9ビュー切り替え（SPA風）: 登録/学年選択/難易度選択/問題一覧/回答/提出確認/結果/管理者採点/採点詳細
- 問題データ: data/math-olympiad-grade1.json 〜 grade6.json（学年別、5ジャンル）
- ジャンル: number_pattern/geometry/logic/combinatorics/word_problem
- 難易度: Lv1(10分)/Lv2(20分)/Lv3(30分+)/Lv4(60分+)/Lv5(90分+)
- ユーザー識別: user_id(UUID) + user_name（表示用）、localStorage管理
- 回答提出: select→insert/update分離（upsert不使用）、pending中は上書き可、reviewed後は不可
- 段階ヒント: 最大3段階、sessionStorage永続化
- タイマー: バックグラウンド計測、sessionStorage永続化（6時間で期限切れ）
- ドラフト保存: answer/thinking入力をsessionStorageに自動保存
- 管理者採点: deviceRole=admin限定、テンプレートコメント5種
- DOMPurify: rubyタグ対応（ALLOWED_TAGS: ruby, rt, br）
- オフライン: sw.jsでHTML+JSONキャッシュ、提出はオンライン時のみ
- game_settings.game_publish.game_math_olympiad で公開制御

## DBテーブル

### math_olympiad_answers（算数オリンピック回答）
- id: UUID (PK), user_id: UUID NOT NULL, user_name: TEXT NOT NULL
- problem_id: INT NOT NULL, answer_text: TEXT NOT NULL, thinking_note: TEXT DEFAULT ''
- elapsed_seconds: INT NOT NULL, hints_used: INT DEFAULT 0
- status: TEXT DEFAULT 'pending' CHECK IN ('pending', 'reviewed')
- score: INT (nullable), admin_comment: TEXT (nullable)
- submitted_at: TIMESTAMPTZ DEFAULT now(), reviewed_at: TIMESTAMPTZ (nullable)
- UNIQUE(user_id, problem_id)
- INDEX: idx_math_answers_user_id, idx_math_answers_status
- RLS有効: SELECT/INSERT全許可、UPDATE=status='pending'のみ

### math_battle_* テーブル
- sql/create_math_battle_tables.sql 参照

## localStorage キー

| キー | 用途 | 永続性 |
|------|------|--------|
| math_olympiad_user | 算数オリンピック ユーザー名（表示用） | 永続 |
| math_olympiad_user_id | 算数オリンピック ユーザーUUID（DB識別子） | 永続 |
| math_hint_history | 算数オリンピック ヒント使用履歴（問題ID→使用回数） | 永続 |

## sessionStorage キー

| キー | 用途 |
|------|------|
| math_timer_start | 算数オリンピック タイマー開始時刻 |
| math_current_problem | 算数オリンピック 現在の問題ID |
| math_hints_revealed | 算数オリンピック 表示済みヒント数 |
| math_answer_draft | 算数オリンピック 回答ドラフト |
| math_thinking_draft | 算数オリンピック 考え方メモドラフト |
