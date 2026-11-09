-- ============================================================
-- button_action_logs を Supabase Realtime 配信対象に追加する
-- ============================================================
--
-- 用途:
--   無線ボタン（ESP32等）→ button-action 申請 → button_action_logs へ記録、を
--   ラズパイの button-voice-listener.py が Realtime 購読して読み上げるため。
--
-- Realtime は「テーブルを publication に追加」して初めて INSERT が配信される。
-- このSQLを Supabase の SQL Editor で1回実行すれば購読が有効になる。
-- 既に追加済みの場合はエラーになるので、その場合は無視してよい。
-- ============================================================

-- INSERT の配信に必要（削除/更新も使うなら FULL が無難だが、本用途は INSERT のみ）
ALTER TABLE button_action_logs REPLICA IDENTITY FULL;

-- Realtime publication に追加
ALTER PUBLICATION supabase_realtime ADD TABLE button_action_logs;
