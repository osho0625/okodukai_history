-- ============================================================
-- 漢字合体 -カンジニオン-（縦STG + 漢字合体パズル）テーブル定義
-- ------------------------------------------------------------
-- 設計方針:
--  - kanji_master / kanji_recipes は全端末共通のマスタ（読み取り中心）
--  - kanji_players / kanji_inventory / kanji_dex は「子供ごと」の
--    プレイデータ。player_id で分離する。
--  - RLSは他ゲームと同様「有効化 + Allow all」。
--    データ削除は created_by_device をフロントで照合し、
--    「作った端末のみ削除可」を実現する（アプリ層で制御）。
--  - バックアップは .github/workflows/backup.yml で毎日取得しロールバック可能。
-- ============================================================

-- ------------------------------------------------------------
-- 1. 漢字マスタ（共通）
--    readings は音訓・特殊読みの配列（JSONB）。
--    例: [
--      {"type":"音","kana":"セイ","display":"セイ"},
--      {"type":"音","kana":"ショウ","display":"ショウ"},
--      {"type":"訓","kana":"い.きる","display":"生きる"},
--      {"type":"訓","kana":"う.まれる","display":"生まれる"},
--      {"type":"訓","kana":"う.む","display":"生む"},
--      {"type":"訓","kana":"なま","display":"生"}
--    ]
--    kana の "." は送り仮名の境界（読み判定の正規化に使用）。
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanji_master (
  char           TEXT PRIMARY KEY,          -- 漢字1文字
  strokes        INT  NOT NULL,             -- 画数
  kentei_level   TEXT NOT NULL DEFAULT '10',-- 漢検級（10,9,...,2,準2,準1,1）
  readings       JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_part        BOOLEAN NOT NULL DEFAULT false, -- 基本パーツ（ドロップ対象）か
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE kanji_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON kanji_master;
CREATE POLICY "Allow all" ON kanji_master FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- 2. 合体レシピ（共通）
--    part_a + part_b (+ part_c) = result_char
--    part_c は NULL 可（2素材レシピ）。合体・分解の双方向に使う。
--    同じ result_char に複数レシピを許す（例: 森=木+林 / 森=木+木+木）。
--    分解時は「画数が大きいパーツを含むレシピ」を優先する（アプリ層で選択）。
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanji_recipes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_char  TEXT NOT NULL REFERENCES kanji_master(char),
  part_a       TEXT NOT NULL REFERENCES kanji_master(char),
  part_b       TEXT NOT NULL REFERENCES kanji_master(char),
  part_c       TEXT REFERENCES kanji_master(char),
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (result_char, part_a, part_b, part_c)
);

CREATE INDEX IF NOT EXISTS idx_kanji_recipes_result ON kanji_recipes (result_char);

ALTER TABLE kanji_recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON kanji_recipes;
CREATE POLICY "Allow all" ON kanji_recipes FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- 3. プレイヤー（子供ごとのセーブデータ）
--    player_id は「子供名 + 端末」ではなく、子供単位のID。
--    equipped_shot / equipped_special は装備中の漢字。
--    created_by_device で「作った端末」を記録（削除制御用）。
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanji_players (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,           -- 子供の名前（表示用）
  equipped_shot         TEXT,                    -- 装備中ショット漢字
  equipped_shot_plus    INT  NOT NULL DEFAULT 0, -- 装備中ショットの+値
  equipped_special      TEXT,                    -- 装備中必殺技漢字
  equipped_special_plus INT  NOT NULL DEFAULT 0, -- 装備中必殺技の+値
  best_score            INT  NOT NULL DEFAULT 0, -- STGハイスコア
  max_stage             INT  NOT NULL DEFAULT 1, -- 到達最大ステージ
  plus_cap              INT  NOT NULL DEFAULT 3, -- +値の上限（フロアボスで増加）
  created_by_device     TEXT,                    -- 作成端末ID（push_device_id）
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE kanji_players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON kanji_players;
CREATE POLICY "Allow all" ON kanji_players FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- 4. 手持ち（最大10枠）
--    同じ漢字を複数持てる（合体素材のため）。
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanji_inventory (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id         UUID NOT NULL REFERENCES kanji_players(id) ON DELETE CASCADE,
  char              TEXT NOT NULL REFERENCES kanji_master(char),
  plus              INT  NOT NULL DEFAULT 0,  -- 強化値（+0〜plus_cap）
  created_by_device TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kanji_inventory_player ON kanji_inventory (player_id);

ALTER TABLE kanji_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON kanji_inventory;
CREATE POLICY "Allow all" ON kanji_inventory FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- 5. 図鑑（子供ごとの読み解放記録）
--    1つの漢字につき解放した読みを1行ずつ登録。
--    reading は正規形（例: 生まれる / いきる / セイ / ショウ）。
--    (player_id, char, reading) で一意。
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanji_dex (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id         UUID NOT NULL REFERENCES kanji_players(id) ON DELETE CASCADE,
  char              TEXT NOT NULL REFERENCES kanji_master(char),
  reading           TEXT NOT NULL,           -- 解放した読み（正規形）
  created_by_device TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (player_id, char, reading)
);

CREATE INDEX IF NOT EXISTS idx_kanji_dex_player ON kanji_dex (player_id);

ALTER TABLE kanji_dex ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON kanji_dex;
CREATE POLICY "Allow all" ON kanji_dex FOR ALL USING (true) WITH CHECK (true);
