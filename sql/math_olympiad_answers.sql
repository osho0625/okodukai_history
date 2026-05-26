CREATE TABLE math_olympiad_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  problem_id INT NOT NULL,
  answer_text TEXT NOT NULL,
  thinking_note TEXT DEFAULT '',
  elapsed_seconds INT NOT NULL,
  hints_used INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  score INT,
  admin_comment TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, problem_id)
);

CREATE INDEX idx_math_answers_user_id ON math_olympiad_answers(user_id);
CREATE INDEX idx_math_answers_status ON math_olympiad_answers(status);

ALTER TABLE math_olympiad_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_select" ON math_olympiad_answers
  FOR SELECT USING (true);

CREATE POLICY "allow_all_insert" ON math_olympiad_answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "update_only_pending" ON math_olympiad_answers
  FOR UPDATE
  USING (status = 'pending')
  WITH CHECK (status = 'reviewed' OR status = 'pending');

-- game_settings に game_math_olympiad キーを追加（初期値: true）
UPDATE game_settings
SET game_publish = game_publish || '{"game_math_olympiad": true}'::jsonb
WHERE id = 1;
