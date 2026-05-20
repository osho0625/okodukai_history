-- 「つじ」の回答をすべて「いろは」に変更
-- user_idも「いろは」のものに揃える

-- まず「いろは」のuser_idを確認
-- SELECT DISTINCT user_id FROM math_olympiad_answers WHERE user_name = 'いろは';

-- 「いろは」のuser_idが存在する場合、そのIDに揃える
UPDATE math_olympiad_answers
SET user_name = 'いろは',
    user_id = (
      SELECT user_id FROM math_olympiad_answers
      WHERE user_name = 'いろは'
      LIMIT 1
    )
WHERE user_name = 'つじ';

-- もし「いろは」のレコードがまだない場合は、以下を使用:
-- UPDATE math_olympiad_answers
-- SET user_name = 'いろは'
-- WHERE user_name = 'つじ';
