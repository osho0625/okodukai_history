// Supabase Edge Function: get-ice-servers
// WebRTC用のICE(STUN/TURN)構成を返す。
// TURN認証情報は app_secrets(key='turn_ice_servers') に隔離し、直接SELECTを禁止。
// WebRTCの性質上ICE構成はクライアントに渡す必要があるため、この関数経由でのみ取得させる。
//
// 使い方（フロント）:
//   POST {} → { iceServers: [...] }
// 未設定時はGoogle STUNのみを返す（フェイルセーフ）。

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_ICE = [{ urls: "stun:stun.l.google.com:19302" }];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { data } = await supabase
      .from("app_secrets")
      .select("value")
      .eq("key", "turn_ice_servers")
      .maybeSingle();

    const iceServers = Array.isArray(data?.value) && data!.value.length > 0
      ? data!.value
      : DEFAULT_ICE;
    return jsonResponse({ iceServers });
  } catch {
    return jsonResponse({ iceServers: DEFAULT_ICE });
  }
});
