-- 算数バトル: パスコード（任意）カラム追加
ALTER TABLE math_battle_rooms ADD COLUMN IF NOT EXISTS passcode TEXT DEFAULT NULL;
