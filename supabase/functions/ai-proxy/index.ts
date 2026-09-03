// Supabase Edge Function: ai-proxy
// AI(Gemini/Groq/OpenAI)呼び出しをサーバー側で行い、APIキーをクライアントに一切渡さない。
// APIキーは app_secrets(gemini_api_key / groq_api_key / openai_api_key) に隔離。
//
// 使い方（フロント）:
//   POST { mode: 'grade'|'chat', prompt: '...', system?: '...', model?: '...' }
//   → { text: 'AIの応答', provider: 'gemini'|'groq'|'openai' }
//
// mode 'grade': Gemini→Groqフォールバック（採点・単発プロンプト用）
// mode 'chat' : model指定で OpenAI(gpt-*) or Gemini/Groq を使用（対戦・相談用）

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// ============================================================
// AI provider callers（キーはサーバー内でのみ使用）
// ============================================================

interface ImageInput { mimeType: string; data: string; }

async function callGemini(apiKey: string, prompt: string, image?: ImageInput): Promise<string> {
  const models = ["gemini-2.0-flash", "gemini-2.5-flash-lite"];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const parts: unknown[] = [{ text: prompt }];
      if (image?.data) parts.push({ inline_data: { mime_type: image.mimeType || "image/jpeg", data: image.data } });
      const reqBody = model.includes("2.5")
        ? { contents: [{ parts }], generationConfig: { thinkingConfig: { thinkingBudget: 0 } } }
        : { contents: [{ parts }] };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const respParts = data.candidates?.[0]?.content?.parts || [];
      const textPart = respParts.find((p: { text?: string }) => p.text !== undefined);
      if (textPart?.text) return textPart.text;
    } catch (_e) {
      continue;
    }
  }
  throw new Error("all_gemini_failed");
}

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error("groq_error_" + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callOpenAI(apiKey: string, system: string, user: string, model: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
    body: JSON.stringify({
      model: model || "gpt-4.1-mini",
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error("openai_error_" + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ============================================================
// Secrets loader
// ============================================================

async function loadKeys(supabase: ReturnType<typeof createClient>): Promise<Record<string, string>> {
  const { data } = await supabase
    .from("app_secrets")
    .select("key, value")
    .in("key", ["gemini_api_key", "groq_api_key", "openai_api_key"]);
  const keys: Record<string, string> = {};
  for (const row of data || []) {
    if (typeof row.value === "string") keys[row.key] = row.value;
  }
  return keys;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  let body: { mode?: string; prompt?: unknown; system?: unknown; model?: unknown; image?: { mimeType?: string; data?: string } };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const system = typeof body.system === "string" ? body.system : "";
  const model = typeof body.model === "string" ? body.model : "";
  const mode = typeof body.mode === "string" ? body.mode : "grade";
  const image = body.image && typeof body.image.data === "string"
    ? { mimeType: body.image.mimeType || "image/jpeg", data: body.image.data }
    : undefined;
  if (!prompt) {
    return jsonResponse({ error: "missing_prompt" }, 400);
  }
  // プロンプト長の上限（濫用対策）
  if (prompt.length > 20000) {
    return jsonResponse({ error: "prompt_too_long" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);
  const keys = await loadKeys(supabase);

  try {
    // 画像入力（Vision）はGeminiのみ対応
    if (image) {
      if (!keys.gemini_api_key) return jsonResponse({ error: "no_vision_provider" }, 503);
      const text = await callGemini(keys.gemini_api_key, prompt, image);
      if (text) return jsonResponse({ text, provider: "gemini" });
      return jsonResponse({ error: "vision_failed" }, 502);
    }

    // chatモードでOpenAIモデル指定かつキーがある場合はOpenAIを使う
    const wantsOpenAI = mode === "chat" && model.startsWith("gpt");
    if (wantsOpenAI && keys.openai_api_key) {
      const text = await callOpenAI(keys.openai_api_key, system, prompt, model);
      if (text) return jsonResponse({ text, provider: "openai" });
    }

    // Gemini → Groq フォールバック
    const geminiPrompt = system ? system + "\n\n" + prompt : prompt;
    if (keys.gemini_api_key) {
      try {
        const text = await callGemini(keys.gemini_api_key, geminiPrompt);
        if (text) return jsonResponse({ text, provider: "gemini" });
      } catch (_e) { /* fall through to groq */ }
    }
    if (keys.groq_api_key) {
      const text = await callGroq(keys.groq_api_key, geminiPrompt);
      if (text) return jsonResponse({ text, provider: "groq" });
    }

    return jsonResponse({ error: "no_available_provider" }, 503);
  } catch (e) {
    return jsonResponse({ error: "ai_call_failed", detail: String(e) }, 502);
  }
});
