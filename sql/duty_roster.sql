-- ============================================================
-- お当番（当番/輪番制）機能
-- game_settings テーブルに duty_roster カラム(JSONB)を追加
-- 作成日: 2026/11/02
-- ============================================================
--
-- データ構造:
-- {
--   "members": ["かいせい", "いろは", "はるちか"],   -- 輪番に参加するメンバー（表示順）
--   "duties":  [                                      -- お当番（仕事）の一覧
--     { "id": "uuid", "name": "しょっきあらい", "emoji": "🍽️" }
--   ],
--   "week_start": "2026-11-02",   -- 現在の輪番が始まった週の月曜日(JST, YYYY-MM-DD)
--   "rotation_offset": 0           -- 週ごとに +1 される輪番オフセット
-- }
--
-- 当番の割り当てルール:
--   members[i] が担当するお当番 = duties[(i + rotation_offset) % duties.length]
--   週が変わるたびに rotation_offset を自動インクリメントして輪番を入れ替える
-- ============================================================

ALTER TABLE game_settings
  ADD COLUMN IF NOT EXISTS duty_roster JSONB
  DEFAULT '{
    "members": ["かいせい", "いろは", "はるちか"],
    "duties": [],
    "week_start": null,
    "rotation_offset": 0
  }'::jsonb;

-- 既存 id=1 行に初期値を設定（NULL の場合のみ）
UPDATE game_settings
SET duty_roster = '{
  "members": ["かいせい", "いろは", "はるちか"],
  "duties": [],
  "week_start": null,
  "rotation_offset": 0
}'::jsonb
WHERE id = 1 AND duty_roster IS NULL;
