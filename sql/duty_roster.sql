-- ============================================================
-- お当番（当番/輪番制）機能
-- game_settings テーブルに duty_roster カラム(JSONB)を追加
-- 作成日: 2026/11/02
-- 更新日: 2026/11/02（1人が複数の当番を担当できる slots モデルに変更）
-- ============================================================
--
-- データ構造（slots モデル）:
-- {
--   "members": ["かいせい", "いろは", "はるちか"],  -- 輪番に参加するメンバー（＝輪番順。並べ替え可能）
--   "slots": [                                       -- 担当枠（members と同じ数）。1枠に当番を複数登録できる
--     {
--       "id": "uuid",
--       "duties": [                                  -- その枠が担当する当番の一覧（0個以上）
--         { "id": "uuid", "name": "しょっきあらい", "emoji": "🍽️" },
--         { "id": "uuid", "name": "ごみだし",       "emoji": "🗑️" }
--       ]
--     }
--   ],
--   "week_start": "2026-11-02",   -- 現在の輪番が始まった週の月曜日(JST, YYYY-MM-DD)
--   "rotation_offset": 0           -- 週ごとに +1 される輪番オフセット
-- }
--
-- 当番の割り当てルール:
--   members[i] が担当する枠 = slots[(i + rotation_offset) % slots.length]
--   → その枠の duties すべてが members[i] の「今週の当番」になる（複数可）
--   週が変わるたびに rotation_offset を自動インクリメントして担当枠を1つずつずらす
--   輪番順を変えたいときは members と slots の並びを一緒に入れ替える
--
-- 備考:
--   - フロント(duty-roster.html / index.html)は旧モデル(duties配列=1枠1当番)を
--     自動で slots モデルへ移行して読み込むため、既存データがあっても壊れない
--   - SQL未適用環境でも localStorage キャッシュで動作するフォールバックあり
-- ============================================================

ALTER TABLE game_settings
  ADD COLUMN IF NOT EXISTS duty_roster JSONB
  DEFAULT '{
    "members": ["かいせい", "いろは", "はるちか"],
    "slots": [
      { "id": "slot-kaisei",   "duties": [] },
      { "id": "slot-iroha",    "duties": [] },
      { "id": "slot-haruchika","duties": [] }
    ],
    "week_start": null,
    "rotation_offset": 0
  }'::jsonb;

-- 既存 id=1 行に初期値を設定（NULL の場合のみ）
UPDATE game_settings
SET duty_roster = '{
  "members": ["かいせい", "いろは", "はるちか"],
  "slots": [
    { "id": "slot-kaisei",   "duties": [] },
    { "id": "slot-iroha",    "duties": [] },
    { "id": "slot-haruchika","duties": [] }
  ],
  "week_start": null,
  "rotation_offset": 0
}'::jsonb
WHERE id = 1 AND duty_roster IS NULL;
