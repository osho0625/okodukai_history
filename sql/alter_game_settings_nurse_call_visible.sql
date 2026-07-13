-- game_settings: ナースコールのuser端末表示フラグ追加
-- 作成日: 2026/07/07

ALTER TABLE game_settings ADD COLUMN nurse_call_visible_to_user BOOLEAN NOT NULL DEFAULT true;
