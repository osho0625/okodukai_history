// Supabase Edge Function: set-secret
// 管理者が秘密（パスワード・合言葉）を app_secrets に書き込む。
// 認可: 現在の admin_password を知っていること（auth_password で照合）。
//       admin_password が未設定の初期状態のみ、認可なしで設定を許可（初回セットアップ）。
//
// 使い方（フロント）:
//   POST { key: 'night_password'|'admin_password'|'broadcast_call_secret', value: '新しい値', auth_password: '現在のadminPW' }
//   → { success: true }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SETTABLE_KEYS = new Set([
  "night_password", "admin_password", "broadcast_call_secret",
  "gemini_api_key", "groq_api_key", "openai_api_key", "turn_ice_servers",
]);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  let body: { key?: unknown; value?: unknown; auth_password?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  const key = typeof body.key === "string" ? body.key : "";
  const value = typeof body.value === "string" ? body.value : "";
  const authPassword = typeof body.auth_password === "string" ? body.auth_password : "";
  if (!SETTABLE_KEYS.has(key)) {
    return jsonResponse({ error: "invalid_key" }, 400);
  }
  if (!value) {
    return jsonResponse({ error: "empty_value" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // 認可: 現在の admin_password と照合
  const { data: adminRow } = await supabase
    .from("app_secrets")
    .select("value")
    .eq("key", "admin_password")
    .maybeSingle();
  const currentAdminPw = typeof adminRow?.value === "string" ? adminRow.value : "";

  // admin_password が既に設定されている場合は照合必須
  if (currentAdminPw) {
    if (!authPassword || !timingSafeEqual(authPassword, currentAdminPw)) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }
  }
  // 未設定なら初回セットアップとして認可なしで許可（admin_passwordを最初に登録する用途）

  const { error } = await supabase
    .from("app_secrets")
    .upsert({ key, value: value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) {
    return jsonResponse({ error: "write_failed", detail: error.message }, 500);
  }
  return jsonResponse({ success: true });
});
