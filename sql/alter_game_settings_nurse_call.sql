-- ナースコール機能: game_settings拡張
-- 作成日: 2026/06/18

ALTER TABLE game_settings ADD COLUMN nurse_call_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE game_settings ADD COLUMN nurse_call_notify_targets JSONB;  -- device_idの配列 or null
ALTER TABLE game_settings ADD COLUMN nurse_call_child_ids JSONB;       -- 対象child_idの配列 or null
ALTER TABLE game_settings ADD COLUMN nurse_call_ice_servers JSONB;     -- STUN/TURN設定

-- デフォルトICE設定（Google公開STUNサーバー）
UPDATE game_settings
SET nurse_call_ice_servers = '[{"urls":"stun:stun.l.google.com:19302"},{"urls":"stun:stun1.l.google.com:19302"}]'::jsonb
WHERE id = 1;
