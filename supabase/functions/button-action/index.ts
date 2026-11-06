// Supabase Edge Function: button-action
// IoTボタン / NFCタグ / スマホショートカット から「お手伝いポイント申請」を行う。
//
// 使い方（デバイス側）:
//   POST  ${SUPABASE_URL}/functions/v1/button-action
//         headers: { 'Content-Type': 'application/json', 'apikey': <ANON_KEY> }
//         body:    { "token": "tok_xxx" }
//   または GET（NFC/ブックマーク向け。apikeyはクエリでも可）:
//     ${SUPABASE_URL}/functions/v1/button-action?token=tok_xxx&apikey=<ANON_KEY>
//
// 処理:
//   1. token から button_actions を引く
//   2. enabled / クールダウン を判定
//   3. 対象の子を children から検索し chore_points に status='pending' で申請（承認制）
//   4. press_count / last_pressed_at を更新、button_action_logs に記録
//   5. Discord通知 + push_messages へ管理者向け通知を積む（cronが配信）
//
// 環境変数:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY（必須）

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// クールダウン中かどうか（最終押下からの経過がcooldown未満ならtrue）
export function isCooldownActive(lastPressedAt: string | null, now: Date, cooldownSeconds: number): boolean {
  if (!lastPressedAt) return false;
  if (!cooldownSeconds || cooldownSeconds <= 0) return false;
  const last = new Date(lastPressedAt).getTime();
  return (now.getTime() - last) < cooldownSeconds * 1000;
}

// リクエストから token を取り出す（body優先、なければクエリ）
export function extractToken(bodyToken: unknown, urlToken: string | null): string | null {
  if (typeof bodyToken === "string" && bodyToken.trim()) return bodyToken.trim();
  if (urlToken && urlToken.trim()) return urlToken.trim();
  return null;
}

async function sendDiscord(supabaseUrl: string, anonOrServiceKey: string, content: string): Promise<void> {
  try {
    await fetch(`${supabaseUrl}/functions/v1/discord-notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": anonOrServiceKey },
      body: JSON.stringify({ content }),
    });
  } catch (e) {
    console.error("Discord notify failed (non-fatal):", e);
  }
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

  // --- token 取得 ---
  const url = new URL(req.url);
  let bodyToken: unknown = null;
  if (req.method === "POST") {
    try {
      const body = await req.json();
      bodyToken = body?.token;
    } catch {
      // bodyなしPOSTも許容（クエリにtokenがあるかもしれない）
    }
  }
  const token = extractToken(bodyToken, url.searchParams.get("token"));
  if (!token) {
    return jsonResponse({ error: "missing_token" }, 400);
  }

  // --- ボタン定義を引く ---
  const { data: btn, error: btnErr } = await supabase
    .from("button_actions")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (btnErr) {
    console.error("button_actions query error:", btnErr);
    return jsonResponse({ error: "internal_error" }, 500);
  }
  if (!btn) {
    // 不正トークンはログだけ残して404
    await supabase.from("button_action_logs").insert({
      label: null, child_name: null, chore_name: null, points: null, result: "not_found",
    });
    return jsonResponse({ error: "invalid_token" }, 404);
  }

  // --- 無効化チェック ---
  if (!btn.enabled) {
    await supabase.from("button_action_logs").insert({
      button_id: btn.id, label: btn.label, child_name: btn.child_name,
      chore_name: btn.chore_name, points: btn.points, result: "disabled",
    });
    return jsonResponse({ error: "disabled", label: btn.label }, 403);
  }

  // --- クールダウンチェック ---
  const now = new Date();
  if (isCooldownActive(btn.last_pressed_at, now, btn.cooldown_seconds)) {
    await supabase.from("button_action_logs").insert({
      button_id: btn.id, label: btn.label, child_name: btn.child_name,
      chore_name: btn.chore_name, points: btn.points, result: "cooldown",
    });
    return jsonResponse({ status: "cooldown", label: btn.label, message: "少し前に押したばかりです" }, 200);
  }

  // --- 対象の子を検索 ---
  const { data: children, error: childErr } = await supabase
    .from("children")
    .select("id, name")
    .eq("name", btn.child_name)
    .limit(1);

  if (childErr) {
    console.error("children query error:", childErr);
    return jsonResponse({ error: "internal_error" }, 500);
  }
  if (!children || children.length === 0) {
    await supabase.from("button_action_logs").insert({
      button_id: btn.id, label: btn.label, child_name: btn.child_name,
      chore_name: btn.chore_name, points: btn.points, result: "error",
    });
    return jsonResponse({ error: "child_not_found", child_name: btn.child_name }, 404);
  }
  const child = children[0];

  // --- chore_points に申請（承認制 / Alexaと同じ） ---
  const { error: insertErr } = await supabase.from("chore_points").insert({
    child_id: child.id,
    chore_name: btn.chore_name,
    points: btn.points,
    status: "pending",
  });
  if (insertErr) {
    console.error("chore_points insert error:", insertErr);
    await supabase.from("button_action_logs").insert({
      button_id: btn.id, label: btn.label, child_name: btn.child_name,
      chore_name: btn.chore_name, points: btn.points, result: "error",
    });
    return jsonResponse({ error: "apply_failed" }, 500);
  }

  // --- 統計更新 + ログ（本質処理の後。失敗しても申請は成功扱い） ---
  try {
    await supabase.from("button_actions").update({
      press_count: (btn.press_count || 0) + 1,
      last_pressed_at: now.toISOString(),
    }).eq("id", btn.id);
  } catch (e) { console.error("stat update failed (non-fatal):", e); }

  try {
    await supabase.from("button_action_logs").insert({
      button_id: btn.id, label: btn.label, child_name: btn.child_name,
      chore_name: btn.chore_name, points: btn.points, result: "applied",
    });
  } catch (e) { console.error("log insert failed (non-fatal):", e); }

  // --- 通知（Discord + push_messages へ積む。cronが配信） ---
  const msg = `🔘 ボタン申請: ${btn.child_name}が「${btn.chore_name}」(${btn.points}pt) を申請しました`;
  await sendDiscord(supabaseUrl, serviceKey, msg);
  try {
    await supabase.from("push_messages").insert({
      target_role: "admin",
      title: "🔘 ボタン ポイント申請",
      body: `${btn.child_name}: ${btn.chore_name} (${btn.points}pt)`,
      sent: false,
    });
  } catch (e) { console.error("push queue failed (non-fatal):", e); }

  return jsonResponse({
    status: "applied",
    label: btn.label,
    child_name: btn.child_name,
    chore_name: btn.chore_name,
    points: btn.points,
    message: `${btn.child_name}の${btn.chore_name}（${btn.points}pt）を申請しました`,
  }, 200);
});
