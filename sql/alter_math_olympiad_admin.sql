-- 管理者操作用: reviewed状態のレコードも更新・削除可能にする
-- 既存の update_only_pending ポリシーを削除して、全許可に変更

-- 既存UPDATEポリシーを削除
DROP POLICY IF EXISTS "update_only_pending" ON math_olympiad_answers;

-- 全UPDATE許可（管理者操作 + 通常提出の両方をカバー）
CREATE POLICY "allow_all_update" ON math_olympiad_answers
  FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE許可（管理者による回答削除用）
CREATE POLICY "allow_all_delete" ON math_olympiad_answers
  FOR DELETE USING (true);

-- 「つじ」の回答をすべて「いろは」に変更
UPDATE math_olympiad_answers
SET user_name = 'いろは',
    user_id = COALESCE(
      (SELECT user_id FROM math_olympiad_answers WHERE user_name = 'いろは' LIMIT 1),
      user_id
    )
WHERE user_name = 'つじ';
