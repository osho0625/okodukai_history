-- pg_cron + pg_net で Edge Function を5分毎に呼び出す
-- Supabase Dashboard の SQL Editor で実行すること
--
-- 前提: pg_cron, pg_net 拡張が有効（Supabaseではデフォルト有効）

-- 1. 拡張を有効化（すでに有効なら無視される）
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. 既存ジョブがあれば削除
SELECT cron.unschedule('push-notify-every-5min')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'push-notify-every-5min'
);

-- 3. 5分毎にEdge Functionを呼び出すcronジョブを作成
SELECT cron.schedule(
  'push-notify-every-5min',        -- ジョブ名
  '*/5 * * * *',                   -- 5分毎
  $$
  SELECT net.http_post(
    url := 'https://ynecezxnltigplrfzzoh.supabase.co/functions/v1/push-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 注意:
-- current_setting('app.settings.service_role_key') が使えない場合は
-- 直接 service_role_key を文字列で埋め込む（Dashboard上でのみ確認可能）:
--
-- 代替パターン:
-- SELECT cron.schedule(
--   'push-notify-every-5min',
--   '*/5 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://ynecezxnltigplrfzzoh.supabase.co/functions/v1/push-notify',
--     headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- ジョブ確認
-- SELECT * FROM cron.job;

-- 実行履歴確認
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
