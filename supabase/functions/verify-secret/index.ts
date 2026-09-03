// Supabase Edge Function: verify-secret
// 秘密（パスワード・合言葉）の照合のみを行い、値そのものは返さない。
// app_secrets テーブル（RLSでanon禁止）を service_role で読み、入力値と比較する。
//
// 対応キー: night_password, admin_password, broadcast_call_secret
//
// 使い方（フロント）:
//   POST { key: 'night_password', value: '入力値' }
//   → { match: true } / { match: false }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 照合を許可するキーのみ（取得系は拒否）
const ALLOWED_KEYS = new Set(["night_password", "admin_password", "broadcast_call_secret"]);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// タイミング攻撃を避けるための定数時間比較
export function timingSafeEqual(a: string, b: string): boolean {
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

  let body: { key?: unknown; value?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  const key = typeof body.key === "string" ? body.key : "";
  const value = typeof body.value === "string" ? body.value : "";
  if (!ALLOWED_KEYS.has(key)) {
    return jsonResponse({ error: "invalid_key" }, 400);
  }
  if (!value) {
    return jsonResponse({ match: false });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase
    .from("app_secrets")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: "lookup_failed" }, 500);
  }
  // 未設定の秘密は不一致扱い（フェイルセーフ）
  const stored = typeof data?.value === "string" ? data.value : "";
  if (!stored) {
    return jsonResponse({ match: false });
  }

  return jsonResponse({ match: timingSafeEqual(value, stored) });
});
