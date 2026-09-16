-- ============================================================
-- kanji_recipes を3素材合体に対応させるマイグレーション
--  - part_c（NULL可）を追加
--  - UNIQUE(result_char) を撤廃し、同じ結果に複数レシピを許可
--    （例: 森=木+林 / 森=木+木+木）
-- create_kanji_blast_tables.sql を既に実行済みのDBで実行する。
-- ============================================================

-- part_c 追加（存在しなければ）
ALTER TABLE kanji_recipes
  ADD COLUMN IF NOT EXISTS part_c TEXT REFERENCES kanji_master(char);

-- 旧 UNIQUE(result_char) 制約を撤廃（名前は環境依存のため両パターン試す）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kanji_recipes_result_char_key') THEN
    ALTER TABLE kanji_recipes DROP CONSTRAINT kanji_recipes_result_char_key;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 新しい一意制約（同一の組み合わせの重複だけ禁止）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kanji_recipes_combo_key') THEN
    ALTER TABLE kanji_recipes
      ADD CONSTRAINT kanji_recipes_combo_key UNIQUE (result_char, part_a, part_b, part_c);
  END IF;
END $$;
