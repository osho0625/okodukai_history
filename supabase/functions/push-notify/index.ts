// Supabase Edge Function: push-notify
// pg_cron (5分毎) → pg_net → この関数を呼び出し
// 1. リマインダー通知（Discord + Web Push to admin）
// 2. push_messagesキュー処理（Web Push配信）
//
// Web Push送信には @pushforge/builder を使用（Deno互換、依存ゼロ）

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { buildPushHTTPRequest } from "npm:@pushforge/builder@latest";

// ============================================================
// Types
// ============================================================

interface Reminder {
  id: string;
  type: "memo" | "event";
  child_id: string;
  child_name: string;
  message: string;
  event_date: string | null;
  custom_schedule: string[] | null;
  snooze_until: string | null;
  deleted_at: string | null;
}

interface PushMessage {
  id: string;
  target_role: "admin" | "user" | "all";
  target_child_name: string | null;
  title: string;
  body: string;
  sent: boolean;
}

interface PushSubscriptionRow {
  id: string;
  device_id: string;
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  child_name: string | null;
  role: string;
}

// ============================================================
// VAPID key conversion helper
// ============================================================

/** Convert base64url-encoded VAPID private key to JWK format for PushForge */
function vapidKeysToJWK(privateKeyBase64url: string, publicKeyBase64url: string): JsonWebKey {
  // Decode public key (uncompressed P-256: 0x04 || x(32) || y(32))
  const rawPublic = base64urlToUint8Array(publicKeyBase64url);
  const x = uint8ArrayToBase64url(rawPublic.slice(1, 33));
  const y = uint8ArrayToBase64url(rawPublic.slice(33, 65));

  return {
    kty: "EC",
    crv: "P-256",
    x,
    y,
    d: privateKeyBase64url,
  };
}

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

// ============================================================
// Web Push送信 (PushForge使用)
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
        options: { ttl: 86400, urgency: "high" },
      },
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body,
    });

    console.log(`Push to ${subscription.endpoint.slice(0, 50)}...: ${response.status}`);
    return { success: response.ok, statusCode: response.status };
  } catch (e) {
    console.error("Push send error:", e);
    return { success: false, statusCode: 0 };
  }
}

// ============================================================
// Reminder logic
// ============================================================

function parseMinutes(hhmm: string): number | null {
  const match = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function isInWindow(scheduledHHMM: string, nowHHMM: string): boolean {
  const scheduled = parseMinutes(scheduledHHMM);
  const current = parseMinutes(nowHHMM);
  if (scheduled === null || current === null) return false;
  return current >= scheduled && current < scheduled + 7;
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function filterDueReminders(reminders: Reminder[], now: { dateStr: string; timeStr: string }): Reminder[] {
  const { dateStr, timeStr } = now;
  return reminders.filter((r) => {
    if (r.deleted_at != null) return false;
    if (r.snooze_until && dateStr < r.snooze_until) return false;
    if (r.type === "event") {
      if (!r.event_date || r.event_date < dateStr) return false;
      const eventDate = new Date(r.event_date + "T00:00:00");
      const sevenDaysBefore = new Date(eventDate);
      sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
      if (dateStr < formatDateStr(sevenDaysBefore) || dateStr > r.event_date) return false;
    }
    const schedules = (r.custom_schedule && Array.isArray(r.custom_schedule) && r.custom_schedule.length > 0)
      ? r.custom_schedule
      : ["07:50", "17:30"];
    return schedules.some((s) => isInWindow(s, timeStr));
  });
}

function calcDaysRemaining(eventDateStr: string, todayStr: string): number {
  const event = new Date(eventDateStr + "T00:00:00");
  const today = new Date(todayStr + "T00:00:00");
  return Math.round((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDiscordMessage(reminders: Reminder[], todayStr: string): string {
  if (reminders.length === 0) return "";
  const memos = reminders.filter((r) => r.type === "memo");
  const events = reminders.filter((r) => r.type === "event");
  let msg = "🔔 リマインダー通知\n";
  if (memos.length > 0) {
    msg += "\n📝 メモ:\n";
    memos.forEach((r) => { msg += `• [${r.child_name}] ${r.message}\n`; });
  }
  if (events.length > 0) {
    msg += "\n📅 行事:\n";
    events.forEach((r) => {
      const days = calcDaysRemaining(r.event_date!, todayStr);
      const mo = parseInt(r.event_date!.split("-")[1], 10);
      const d = parseInt(r.event_date!.split("-")[2], 10);
      msg += `• [${r.child_name}] ${r.message}（あと${days}日 - ${mo}/${d}）\n`;
    });
  }
  return msg.trim();
}

// ============================================================
// Helpers
// ============================================================

function getCurrentJST(): { dateStr: string; timeStr: string } {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const mo = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  const h = String(jst.getUTCHours()).padStart(2, "0");
  const mi = String(jst.getUTCMinutes()).padStart(2, "0");
  return { dateStr: `${y}-${mo}-${d}`, timeStr: `${h}:${mi}` };
}

async function supabaseGet(url: string, key: string, path: string): Promise<any> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase GET ${path}: ${res.status}`);
  return res.json();
}

async function supabasePatch(url: string, key: string, path: string, body: any): Promise<void> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method: "PATCH",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error(`Supabase PATCH ${path}: ${res.status}`);
}

async function supabaseDelete(url: string, key: string, path: string): Promise<void> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method: "DELETE",
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) console.error(`Supabase DELETE ${path}: ${res.status}`);
}

// ============================================================
// Main handler
// ============================================================

serve(async (_req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_KEY")!;
    const DISCORD_WEBHOOK = Deno.env.get("DISCORD_WEBHOOK")!;
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "mailto:admin@example.com";

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return new Response(JSON.stringify({ error: "Missing env vars" }), { status: 500 });
    }

    const privateJWK = vapidKeysToJWK(VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY);
    const now = getCurrentJST();
    console.log(`JST: ${now.dateStr} ${now.timeStr}`);

    const results: string[] = [];

    // ---- Part 1: Reminder notifications ----
    const reminders: Reminder[] = await supabaseGet(SUPABASE_URL, SUPABASE_KEY, "reminders?deleted_at=is.null&select=*");
    const due = filterDueReminders(reminders, now);
    results.push(`Reminders: ${reminders.length} total, ${due.length} due`);

    if (due.length > 0) {
      if (DISCORD_WEBHOOK) {
        const message = formatDiscordMessage(due, now.dateStr);
        await fetch(DISCORD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: message }),
        });
        results.push("Discord: sent");
      }

      const adminSubs: PushSubscriptionRow[] = await supabaseGet(
        SUPABASE_URL, SUPABASE_KEY, "push_subscriptions?role=eq.admin&select=*"
      );
      if (adminSubs.length > 0) {
        const memos = due.filter((r) => r.type === "memo");
        const events = due.filter((r) => r.type === "event");
        const bodyLines: string[] = [];
        memos.forEach((r) => bodyLines.push(`📝 [${r.child_name}] ${r.message}`));
        events.forEach((r) => {
          const days = calcDaysRemaining(r.event_date!, now.dateStr);
          bodyLines.push(`📅 [${r.child_name}] ${r.message}（あと${days}日）`);
        });
        const payload = JSON.stringify({
          title: "🔔 リマインダー通知",
          body: bodyLines.join("\n"),
          tag: "reminder-" + now.dateStr + "-" + now.timeStr.replace(":", ""),
          url: "/okodukai_history/index.html",
        });
        const pushResults = await sendToSubscriptions(adminSubs, payload, privateJWK, VAPID_EMAIL, SUPABASE_URL, SUPABASE_KEY);
        results.push(`Push(admin): ${pushResults.sent}/${adminSubs.length} sent, ${pushResults.failed} failed`);
      }
    }

    // ---- Part 2: push_messages queue ----
    const messages: PushMessage[] = await supabaseGet(
      SUPABASE_URL, SUPABASE_KEY, "push_messages?sent=eq.false&select=*&order=created_at.asc"
    );
    results.push(`Queue: ${messages.length} pending`);

    for (const msg of messages) {
      let subFilter = "push_subscriptions?select=*";
      if (msg.target_role === "admin") subFilter += "&role=eq.admin";
      else if (msg.target_role === "user") subFilter += "&role=eq.user";
      if (msg.target_child_name) subFilter += `&child_name=eq.${encodeURIComponent(msg.target_child_name)}`;

      const subs: PushSubscriptionRow[] = await supabaseGet(SUPABASE_URL, SUPABASE_KEY, subFilter);
      if (subs.length > 0) {
        const payload = JSON.stringify({
          title: msg.title,
          body: msg.body,
          tag: "msg-" + msg.id,
          url: "/okodukai_history/index.html",
        });
        const pushResult = await sendToSubscriptions(subs, payload, privateJWK, VAPID_EMAIL, SUPABASE_URL, SUPABASE_KEY);
        results.push(`Msg[${msg.id.slice(0,8)}]: ${pushResult.sent}/${subs.length} sent`);
      }

      await supabasePatch(SUPABASE_URL, SUPABASE_KEY, `push_messages?id=eq.${msg.id}`, { sent: true });
    }

    return new Response(JSON.stringify({ ok: true, jst: `${now.dateStr} ${now.timeStr}`, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Edge Function error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

async function sendToSubscriptions(
  subs: PushSubscriptionRow[],
  payload: string,
  privateJWK: JsonWebKey,
  vapidEmail: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ sent: number; failed: number; expired: number }> {
  let sent = 0;
  let failed = 0;
  const expiredIds: string[] = [];

  for (const sub of subs) {
    const result = await sendPushNotification(sub.subscription, payload, privateJWK, vapidEmail);
    if (result.success) {
      sent++;
    } else if (result.statusCode === 410 || result.statusCode === 404) {
      expiredIds.push(sub.id);
    } else {
      failed++;
      console.error(`Push failed for ${sub.device_id}: status ${result.statusCode}`);
    }
  }

  for (const id of expiredIds) {
    await supabaseDelete(supabaseUrl, supabaseKey, `push_subscriptions?id=eq.${id}`);
  }

  return { sent, failed, expired: expiredIds.length };
}
