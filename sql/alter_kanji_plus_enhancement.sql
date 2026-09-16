-- ============================================================
-- 漢字合体ブラスト: +値（エンハンス）機構のマイグレーション
--  - kanji_inventory.plus（強化値 +0〜）
--  - kanji_players に装備plusと plus_cap（+上限）を追加
-- create_kanji_blast_tables.sql 実行済みDBで実行する。
-- ============================================================

ALTER TABLE kanji_inventory
  ADD COLUMN IF NOT EXISTS plus INT NOT NULL DEFAULT 0;

ALTER TABLE kanji_players
  ADD COLUMN IF NOT EXISTS equipped_shot_plus    INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS equipped_special_plus INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plus_cap              INT NOT NULL DEFAULT 3;
