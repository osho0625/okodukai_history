-- ============================================================
-- IoTボタン（物理ボタン / NFC / スマホショートカット）→ お手伝いポイント申請
-- 作成日: 2026/11/02
-- ============================================================
--
-- 仕組み:
--   物理ボタンやNFCタグは「決まったURLに決まったトークンをPOSTする」だけ。
--   Edge Function `button-action` がトークンから下記レコードを引き、
--   対象の子・家事名・ポイントを解決して chore_points に status='pending' で申請する
--   （Alexa申請と同じ承認制フロー）。
--
-- セキュリティ:
--   - デバイスに焼くのは token だけ。漏れても「そのボタンの申請」しかできない
--   - token は十分に長いランダム文字列にする（管理画面が自動生成）
--   - クールダウン(cooldown_seconds)で誤連打による多重申請を防ぐ
--   - RLSは既存テーブル同様に無効化し、Edge Function(service_role)経由でのみ書き込む
-- ============================================================

CREATE TABLE IF NOT EXISTS button_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,              -- デバイスに焼くシークレット（押下時に送る）
  label TEXT NOT NULL DEFAULT '',          -- 管理画面での表示名（例: いろはのゴミ捨てボタン）
  child_name TEXT NOT NULL,                -- 対象の子（例: いろは）
  chore_name TEXT NOT NULL,                -- 家事名（例: ゴミ出し）
  points INT NOT NULL DEFAULT 1,           -- 申請ポイント
  enabled BOOLEAN NOT NULL DEFAULT TRUE,   -- 無効化フラグ
  cooldown_seconds INT NOT NULL DEFAULT 30,-- 連打防止のクールダウン秒数
  press_count INT NOT NULL DEFAULT 0,      -- 累計押下回数（成功時のみ加算）
  last_pressed_at TIMESTAMPTZ,             -- 最終押下時刻（クールダウン判定に使用）
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- トークン検索用インデックス
CREATE INDEX IF NOT EXISTS idx_button_actions_token ON button_actions (token);

-- 既存テーブルと同様、RLSは無効（Edge Function の service_role 経由でのみ操作）
ALTER TABLE button_actions DISABLE ROW LEVEL SECURITY;

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION set_button_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_button_actions_updated_at ON button_actions;
CREATE TRIGGER trg_button_actions_updated_at
  BEFORE UPDATE ON button_actions
  FOR EACH ROW EXECUTE FUNCTION set_button_actions_updated_at();

-- ============================================================
-- 押下ログ（任意・監査用）。誰のどのボタンがいつ押されたかを記録
-- ============================================================
CREATE TABLE IF NOT EXISTS button_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  button_id UUID REFERENCES button_actions(id) ON DELETE SET NULL,
  label TEXT,
  child_name TEXT,
  chore_name TEXT,
  points INT,
  result TEXT NOT NULL,          -- 'applied' | 'cooldown' | 'disabled' | 'not_found' | 'error'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_button_action_logs_created ON button_action_logs (created_at DESC);

ALTER TABLE button_action_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- サンプル投入（必要なら管理画面から追加/編集してください）
-- token は本番では必ず管理画面の自動生成（長いランダム）を使うこと
-- ============================================================
-- INSERT INTO button_actions (token, label, child_name, chore_name, points)
-- VALUES ('tok_sample_please_replace', 'いろはのゴミ捨て', 'いろは', 'ゴミ出し', 2);
