// Supabase Edge Function: discord-notify
// フロントからのDiscord通知を中継する。
// Webhook URLをクライアントに露出させないため、実URLは環境変数 DISCORD_WEBHOOK に隠す。
//
// 使い方（フロント）:
//   fetch(`${SUPABASE_URL}/functions/v1/discord-notify`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
//     body: JSON.stringify({ content: 'メッセージ' })
//   });
//
// 環境変数:
//   DISCORD_WEBHOOK - Discord Webhook URL（秘密。ダッシュボードで設定）

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// content を安全な範囲に整える（Discordの2000文字制限、型チェック）
export function sanitizeContent(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, 2000);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const webhook = Deno.env.get("DISCORD_WEBHOOK");
  if (!webhook) {
    return jsonResponse({ error: "webhook_not_configured" }, 500);
  }

  let body: { content?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  const content = sanitizeContent(body.content);
  if (!content) {
    return jsonResponse({ error: "invalid_content" }, 400);
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      return jsonResponse({ error: "discord_error", status: res.status }, 502);
    }
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ error: "fetch_failed", detail: String(e) }, 502);
  }
});
