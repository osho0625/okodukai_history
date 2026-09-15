-- game_settings: 自動ポイント付与設定用カラム追加
-- 作成日: 2026/09/15
--
-- 管理者ページから「誰に・何のポイントを・何ポイント・何日ごとに・何時に」付与するかを設定する。
-- auto-chore-points.js（GitHub Actions cron）がこの設定を読み込んで自動付与を行う。

ALTER TABLE game_settings ADD COLUMN IF NOT EXISTS auto_chore_config JSONB DEFAULT NULL;

-- 構造例:
-- {
--   "hour": 7,                       -- 付与を行うJST時刻（0-23）
--   "rules": [
--     { "childName": "りょうすけ", "choreName": "食洗器回し", "points": 4, "everyNDays": 1 },
--     { "childName": "りょうすけ", "choreName": "洗濯機",     "points": 9, "everyNDays": 2 },
--     { "childName": "めぐみ",     "choreName": "食洗器",     "points": 3, "everyNDays": 2 },
--     { "childName": "めぐみ",     "choreName": "料理",       "points": 10, "everyNDays": 1 }
--   ]
-- }
