-- ============================================================
-- 漢字合体ブラスト 初期データ（漢字マスタ + 合体レシピ）
-- create_kanji_blast_tables.sql の後に実行すること。
-- ------------------------------------------------------------
-- readings の kana は「.」で送り仮名の境界を示す（例: う.まれる）。
-- display は図鑑登録される正規形。
-- part_a / part_b / result_char は kanji_master への外部キー制約が
-- あるため、レシピで使う漢字はすべて下のマスタに存在させること。
-- ============================================================

-- ------------------------------------------------------------
-- 漢字マスタ
--   is_part=true : 敵/ボスがドロップする基本パーツ
--   is_part=false: 合体で作る漢字
-- ------------------------------------------------------------
INSERT INTO kanji_master (char, strokes, kentei_level, is_part, readings) VALUES
-- === 基本パーツ（ドロップ対象） ===
('一', 1, '10', true, '[{"type":"音","kana":"イチ","display":"イチ"},{"type":"音","kana":"イツ","display":"イツ"},{"type":"訓","kana":"ひと","display":"ひと"},{"type":"訓","kana":"ひと.つ","display":"一つ"}]'),
('十', 2, '10', true, '[{"type":"音","kana":"ジュウ","display":"ジュウ"},{"type":"音","kana":"ジッ","display":"ジッ"},{"type":"訓","kana":"とお","display":"とお"},{"type":"訓","kana":"と","display":"と"}]'),
('口', 3, '10', true, '[{"type":"音","kana":"コウ","display":"コウ"},{"type":"音","kana":"ク","display":"ク"},{"type":"訓","kana":"くち","display":"くち"}]'),
('日', 4, '10', true, '[{"type":"音","kana":"ニチ","display":"ニチ"},{"type":"音","kana":"ジツ","display":"ジツ"},{"type":"訓","kana":"ひ","display":"ひ"},{"type":"訓","kana":"か","display":"か"}]'),
('月', 4, '10', true, '[{"type":"音","kana":"ゲツ","display":"ゲツ"},{"type":"音","kana":"ガツ","display":"ガツ"},{"type":"訓","kana":"つき","display":"つき"}]'),
('木', 4, '10', true, '[{"type":"音","kana":"モク","display":"モク"},{"type":"音","kana":"ボク","display":"ボク"},{"type":"訓","kana":"き","display":"き"},{"type":"訓","kana":"こ","display":"こ"}]'),
('火', 4, '10', true, '[{"type":"音","kana":"カ","display":"カ"},{"type":"訓","kana":"ひ","display":"ひ"},{"type":"訓","kana":"ほ","display":"ほ"}]'),
('水', 4, '10', true, '[{"type":"音","kana":"スイ","display":"スイ"},{"type":"訓","kana":"みず","display":"みず"}]'),
('田', 5, '10', true, '[{"type":"音","kana":"デン","display":"デン"},{"type":"訓","kana":"た","display":"た"}]'),
('力', 2, '10', true, '[{"type":"音","kana":"リョク","display":"リョク"},{"type":"音","kana":"リキ","display":"リキ"},{"type":"訓","kana":"ちから","display":"ちから"}]'),
('人', 2, '10', true, '[{"type":"音","kana":"ジン","display":"ジン"},{"type":"音","kana":"ニン","display":"ニン"},{"type":"訓","kana":"ひと","display":"ひと"}]'),
('目', 5, '10', true, '[{"type":"音","kana":"モク","display":"モク"},{"type":"音","kana":"ボク","display":"ボク"},{"type":"訓","kana":"め","display":"め"},{"type":"訓","kana":"ま","display":"ま"}]'),
('土', 3, '10', true, '[{"type":"音","kana":"ド","display":"ド"},{"type":"音","kana":"ト","display":"ト"},{"type":"訓","kana":"つち","display":"つち"}]'),
('女', 3, '10', true, '[{"type":"音","kana":"ジョ","display":"ジョ"},{"type":"音","kana":"ニョ","display":"ニョ"},{"type":"訓","kana":"おんな","display":"おんな"},{"type":"訓","kana":"め","display":"め"}]'),
('子', 3, '10', true, '[{"type":"音","kana":"シ","display":"シ"},{"type":"音","kana":"ス","display":"ス"},{"type":"訓","kana":"こ","display":"こ"}]'),
('大', 3, '10', true, '[{"type":"音","kana":"ダイ","display":"ダイ"},{"type":"音","kana":"タイ","display":"タイ"},{"type":"訓","kana":"おお","display":"おお"},{"type":"訓","kana":"おお.きい","display":"大きい"}]'),
('山', 3, '10', true, '[{"type":"音","kana":"サン","display":"サン"},{"type":"訓","kana":"やま","display":"やま"}]'),
('石', 5, '10', true, '[{"type":"音","kana":"セキ","display":"セキ"},{"type":"音","kana":"シャク","display":"シャク"},{"type":"訓","kana":"いし","display":"いし"}]'),
('鳥', 11,'9',  true, '[{"type":"音","kana":"チョウ","display":"チョウ"},{"type":"訓","kana":"とり","display":"とり"}]')
ON CONFLICT (char) DO NOTHING;

INSERT INTO kanji_master (char, strokes, kentei_level, is_part, readings) VALUES
-- === 合体で作れる漢字 ===
('林', 8,  '10', false, '[{"type":"音","kana":"リン","display":"リン"},{"type":"訓","kana":"はやし","display":"はやし"}]'),
('森', 12, '10', false, '[{"type":"音","kana":"シン","display":"シン"},{"type":"訓","kana":"もり","display":"もり"}]'),
('炎', 8,  '準2', false, '[{"type":"音","kana":"エン","display":"エン"},{"type":"訓","kana":"ほのお","display":"ほのお"}]'),
('明', 8,  '9',  false, '[{"type":"音","kana":"メイ","display":"メイ"},{"type":"音","kana":"ミョウ","display":"ミョウ"},{"type":"訓","kana":"あ.かるい","display":"明るい"},{"type":"訓","kana":"あ.ける","display":"明ける"}]'),
('男', 7,  '10', false, '[{"type":"音","kana":"ダン","display":"ダン"},{"type":"音","kana":"ナン","display":"ナン"},{"type":"訓","kana":"おとこ","display":"おとこ"}]'),
('相', 9,  '8',  false, '[{"type":"音","kana":"ソウ","display":"ソウ"},{"type":"音","kana":"ショウ","display":"ショウ"},{"type":"訓","kana":"あい","display":"あい"}]'),
('好', 6,  '8',  false, '[{"type":"音","kana":"コウ","display":"コウ"},{"type":"訓","kana":"この.む","display":"好む"},{"type":"訓","kana":"す.く","display":"好く"}]'),
('休', 6,  '10', false, '[{"type":"音","kana":"キュウ","display":"キュウ"},{"type":"訓","kana":"やす.む","display":"休む"},{"type":"訓","kana":"やす.まる","display":"休まる"}]'),
('畑', 9,  '準2', false, '[{"type":"訓","kana":"はた","display":"はた"},{"type":"訓","kana":"はたけ","display":"はたけ"}]'),
('岩', 8,  '9',  false, '[{"type":"音","kana":"ガン","display":"ガン"},{"type":"訓","kana":"いわ","display":"いわ"}]'),
('品', 9,  '9',  false, '[{"type":"音","kana":"ヒン","display":"ヒン"},{"type":"訓","kana":"しな","display":"しな"}]'),
('晶', 12, '準1', false, '[{"type":"音","kana":"ショウ","display":"ショウ"}]'),
('鳴', 14, '8',  false, '[{"type":"音","kana":"メイ","display":"メイ"},{"type":"訓","kana":"な.く","display":"鳴く"},{"type":"訓","kana":"な.る","display":"鳴る"},{"type":"訓","kana":"な.らす","display":"鳴らす"}]')
ON CONFLICT (char) DO NOTHING;

-- ------------------------------------------------------------
-- 合体レシピ（part_a + part_b = result_char）
-- すべて上のマスタに存在する漢字で構成。
-- ------------------------------------------------------------
INSERT INTO kanji_recipes (result_char, part_a, part_b) VALUES
('林', '木', '木'),   -- 木＋木＝林
('森', '木', '林'),   -- 木＋林＝森
('炎', '火', '火'),   -- 火＋火＝炎
('明', '日', '月'),   -- 日＋月＝明
('男', '田', '力'),   -- 田＋力＝男
('相', '木', '目'),   -- 木＋目＝相
('好', '女', '子'),   -- 女＋子＝好
('休', '人', '木'),   -- 人＋木＝休
('畑', '火', '田'),   -- 火＋田＝畑
('岩', '山', '石'),   -- 山＋石＝岩
('品', '口', '口'),   -- 口＋口＝品
('晶', '日', '品'),   -- 日＋品＝晶
('鳴', '口', '鳥')    -- 口＋鳥＝鳴
ON CONFLICT (result_char) DO NOTHING;
