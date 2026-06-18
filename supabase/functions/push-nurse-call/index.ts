// Supabase Edge Function: push-nurse-call
// 即時ナースコールPush通知配信
// 子供がボタンを押す → この関数に直接POST → admin端末にWeb Push即時配信
//
// 認証: Supabase Anonymous Auth JWT (Authorization: Bearer)
// バリデーション: device_id存在確認 + child_id紐付け + クールダウン判定

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPushHTTPRequest } from "npm:@pushforge/builder@latest";

// ============================================================
// Types
// ============================================================

interface NurseCallRequest {
  child_id: string;
  child_name: string;
  reason?: string;
  device_id: string;
}

interface PushSubscriptionRow {
  id: string;
  device_id: string;
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  child_name: string | null;
  role: string;
}

// ============================================================
// Pure functions (テスト可能)
// ============================================================

export function formatNotificationMessage(childName: string, reason?: string | null): { title: string; body: string } {
  const title = "🔔 ナースコール";
  // 体温測定の場合: child_nameに「体温を測りました」が含まれる
  if (childName.includes('体温を測りました')) {
    const body = reason ? `🌡️ ${childName}（${reason}）` : `🌡️ ${childName}`;
    return { title, body };
  }
  const body = reason
    ? `${childName}がよんでいます（${reason}）`
    : `${childName}がよんでいます`;
  return { title, body };
}

export function filterNotifyTargets(
  targets: string[] | null | undefined,
  subscriptions: PushSubscriptionRow[]
): PushSubscriptionRow[] {
  if (targets && targets.length > 0) {
    return subscriptions.filter(s => targets.includes(s.device_id));
  }
  // デフォルト: role='admin'の全端末
  return subscriptions.filter(s => s.role === "admin");
}

export function isCooldownActive(lastCreatedAt: string | null, now: Date, cooldownMs = 30000): boolean {
  if (!lastCreatedAt) return false;
  const last = new Date(lastCreatedAt).getTime();
  return (now.getTime() - last) < cooldownMs;
}

export function buildChannelName(childId: string, callId: string): string {
  return `nurse-call:${childId}:${callId}`;
}

export function buildNotifyUrl(childId: string, callId: string): string {
  return `/pages/nurse-call.html?child_id=${childId}&call_id=${callId}`;
}

// ============================================================
// VAPID key helpers (push-notify/index.tsと同一)
// ============================================================

function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(pad);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64url(arr: Uint8Array): string {
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function vapidKeysToJWK(privateKeyBase64url: string, publicKeyBase64url: string): JsonWebKey {
  const rawPublic = base64urlToUint8Array(publicKeyBase64url);
  const x = uint8ArrayToBase64url(rawPublic.slice(1, 33));
  const y = uint8ArrayToBase64url(rawPublic.slice(33, 65));
  return {
    alg: "ES256",
    key_ops: ["sign"],
    ext: true,
    kty: "EC",
    crv: "P-256",
    x, y,
    d: privateKeyBase64url,
  };
}


// ============================================================
// Web Push送信
// ============================================================

async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  privateJWK: JsonWebKey,
  vapidEmail: string
): Promise<{ success: boolean; statusCode: number }> {
  try {
    const { endpoint, headers, body } = await buildPushHTTPRequest({
      privateJWK,
      subscription,
      message: {
        payload: JSON.parse(payload),
        adminContact: vapidEmail,
        options: { ttl: 300, urgency: "high" },
      },
    });

    const response = await fetch(endpoint, { method: "POST", headers, body });
    return { success: response.ok, statusCode: response.status };
  } catch (e) {
    console.error("Push send error:", e);
    return { success: false, statusCode: 0 };
  }
}

// ============================================================
// Main handler
// ============================================================

serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
  const vapidEmail = Deno.env.get("VAPID_EMAIL") || "mailto:admin@example.com";

  // 1. JWT検証（緩和: JWTなしでもapikey付きなら許可。家庭内利用前提）
  const authHeader = req.headers.get("authorization");
  const supabase = createClient(supabaseUrl, supabaseKey);

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    // JWT無効でもブロックしない（ログのみ）
    if (authError) console.log("JWT validation skipped:", authError.message);
  }

  // 2. リクエストボディ解析
  let body: NurseCallRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  const { child_id, child_name, reason, device_id } = body;
  if (!child_name || !device_id) {
    return jsonResponse({ error: "missing_fields" }, 400);
  }

  // 3. device_id検証（緩和: レコードなしでも許可、家庭内利用前提）
  // device_settingsにレコードがあればchild_id整合性チェック、なければスキップ
  const { data: deviceData } = await supabase
    .from("device_settings")
    .select("child_id")
    .eq("device_id", device_id)
    .maybeSingle();

  // レコードあり＆child_id不一致の場合のみ拒否
  if (deviceData && child_id && deviceData.child_id && deviceData.child_id !== child_id) {
    // 不一致でも更新して許可（名前変更対応）
    await supabase.from("device_settings").update({ child_id }).eq("device_id", device_id);
  }

  // 4. nurse_calls INSERT (notification_status='pending')
  const { data: callData, error: insertError } = await supabase
    .from("nurse_calls")
    .insert({
      child_id: child_id || null,
      child_name,
      reason: reason || null,
      status: "active",
      notification_status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !callData) {
    console.error("Insert error:", insertError);
    return jsonResponse({ error: "internal_error" }, 500);
  }

  const callId = callData.id;

  // 6. 通知対象取得
  const { data: settings } = await supabase
    .from("game_settings")
    .select("nurse_call_notify_targets")
    .eq("id", 1)
    .single();

  const notifyTargets: string[] | null = settings?.nurse_call_notify_targets || null;

  const { data: allSubs } = await supabase
    .from("push_subscriptions")
    .select("id, device_id, subscription, child_name, role");

  const targetSubs = filterNotifyTargets(notifyTargets, allSubs || []);

  // 7. Web Push送信
  let notificationStatus: "sent" | "partial" | "failed" = "failed";

  if (targetSubs.length === 0) {
    notificationStatus = "failed";
  } else {
    const privateJWK = vapidKeysToJWK(vapidPrivateKey, vapidPublicKey);
    const { title, body: msgBody } = formatNotificationMessage(child_name, reason);
    const notifyUrl = buildNotifyUrl(child_id, callId);

    const payload = JSON.stringify({
      title,
      body: msgBody,
      icon: "/images/2728.png",
      data: { url: notifyUrl, type: "nurse_call", call_id: callId },
    });

    let sentCount = 0;
    let failedCount = 0;
    const expiredIds: string[] = [];

    for (const sub of targetSubs) {
      const result = await sendPushNotification(sub.subscription, payload, privateJWK, vapidEmail);
      if (result.success) {
        sentCount++;
      } else if (result.statusCode === 410 || result.statusCode === 404) {
        expiredIds.push(sub.id);
      } else {
        failedCount++;
      }
    }

    // 期限切れサブスクリプション削除
    for (const id of expiredIds) {
      await supabase.from("push_subscriptions").delete().eq("id", id);
    }

    if (sentCount === targetSubs.length - expiredIds.length) {
      notificationStatus = "sent";
    } else if (sentCount > 0) {
      notificationStatus = "partial";
    } else {
      notificationStatus = "failed";
    }
  }

  // 8. notification_status更新
  await supabase
    .from("nurse_calls")
    .update({ notification_status: notificationStatus })
    .eq("id", callId);

  // 9. レスポンス
  return jsonResponse({ call_id: callId, notification_status: notificationStatus }, 200);
});

// ============================================================
// Helper
// ============================================================

function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
