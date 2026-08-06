// Supabase Edge Function: cors-proxy
// ニュースアプリ用CORSプロキシ
// RSSフィードをクロスオリジンで取得するためのプロキシサーバー

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://osho0625.github.io",
  "https://kc-asse.github.io",
  "http://localhost",
  "http://127.0.0.1",
];

const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5MB
const FETCH_TIMEOUT_MS = 15000; // 15秒

function corsHeaders(origin: string): Record<string, string> {
  const isAllowed = ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
    "Access-Control-Max-Age": "86400",
  };
}

serve(async (req: Request) => {
  const origin = req.headers.get("Origin") || "";

  // プリフライト
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  // GETのみ許可
  if (req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders(origin),
    });
  }

  // URLパラメータ取得
  const requestUrl = new URL(req.url);
  const targetUrl = requestUrl.searchParams.get("url");

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing ?url= parameter" }), {
      status: 400,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  // URLバリデーション
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid URL" }), {
      status: 400,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  // フィード取得
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FamilyNewsReader/1.0)",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        "Accept-Language": "ja,en;q=0.9",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream returned ${response.status}` }),
        {
          status: 502,
          headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
        }
      );
    }

    const body = await response.text();

    if (body.length > MAX_RESPONSE_BYTES) {
      return new Response(JSON.stringify({ error: "Response too large" }), {
        status: 413,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const contentType = response.headers.get("Content-Type") || "text/xml";

    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders(origin),
        "Content-Type": contentType,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("aborted") ? 504 : 502;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
});
