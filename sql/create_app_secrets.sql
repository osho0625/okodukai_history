-- ============================================================
-- app_secrets: 秘密情報の隔離テーブル
-- 作成日: 2026/09/03
--
-- 目的: anon key（公開）で直接SELECTできる game_settings / app_config から
--       秘密情報を分離し、RLSで anon のアクセスを完全に禁止する。
--       値の取得・照合はすべて Edge Function（service_role）経由に限定する。
--
-- 移行対象の秘密:
--   照合系（値は返さない）: night_password, admin_password, broadcast_call_secret
--   取得系（Edge Function経由でのみ返す）: turn_ice_servers, gemini_api_key, groq_api_key, openai_api_key
-- ============================================================

CREATE TABLE IF NOT EXISTS app_secrets (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS有効 + ポリシー無し = anon/authenticated からのアクセスを全面禁止。
-- service_role（Edge Function）は RLS をバイパスするのでアクセス可能。
ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;

-- 念のため明示的に権限を剥奪（RLSに加えて多層防御）
REVOKE ALL ON app_secrets FROM anon;
REVOKE ALL ON app_secrets FROM authenticated;

-- ============================================================
-- 初期データ移行（既存の秘密を app_secrets へコピー）
-- 実行前に game_settings / app_config の現行値を確認しておくこと。
-- 値が入っていないものはスキップしてよい。
-- ============================================================

-- 照合系（文字列をJSONBとしてToText保存）
INSERT INTO app_secrets (key, value)
SELECT 'night_password', to_jsonb(night_password)
FROM game_settings WHERE id = 1 AND night_password IS NOT NULL
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO app_secrets (key, value)
SELECT 'admin_password', to_jsonb(admin_password)
FROM game_settings WHERE id = 1 AND admin_password IS NOT NULL
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO app_secrets (key, value)
SELECT 'broadcast_call_secret', to_jsonb(broadcast_call_secret)
FROM game_settings WHERE id = 1 AND broadcast_call_secret IS NOT NULL
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 取得系: TURN/ICE構成（broadcast優先、なければnurse_call）
INSERT INTO app_secrets (key, value)
SELECT 'turn_ice_servers', COALESCE(broadcast_ice_servers, nurse_call_ice_servers)
FROM game_settings WHERE id = 1
  AND COALESCE(broadcast_ice_servers, nurse_call_ice_servers) IS NOT NULL
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 取得系: AIキー（app_config の key/value から移行）
INSERT INTO app_secrets (key, value)
SELECT key, to_jsonb(value)
FROM app_config WHERE key IN ('gemini_api_key', 'groq_api_key', 'openai_api_key')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ============================================================
-- 移行後のクリーンアップ（動作確認が済んでから実行すること）
-- ============================================================
-- 秘密を app_secrets に移し、Edge Function経由の動作を確認したら、
-- 元テーブルの平文の秘密を削除する:
--
--   UPDATE game_settings SET
--     night_password = NULL,
--     admin_password = NULL,
--     broadcast_call_secret = NULL,
--     broadcast_ice_servers = NULL,
--     nurse_call_ice_servers = NULL
--   WHERE id = 1;
--
--   DELETE FROM app_config WHERE key IN ('gemini_api_key', 'groq_api_key', 'openai_api_key');
--
-- ※ 先に Edge Function のデプロイと全ページの切り替えを完了させること。
