// Supabase Edge Function: push-notify
// pg_cron (5分毎) → pg_net → この関数を呼び出し
// 1. リマインダー通知（Discord + Web Push to admin）
// 2. push_messagesキュー処理（Web Push配信）

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

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
  subscription: PushSubscription;
  child_name: string | null;
  role: string;
}

interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// ============================================================
// VAPID / Web Push (raw Web Crypto API implementation)
// ============================================================

/** Base64url decode to Uint8Array */
function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(pad);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Uint8Array to Base64url string */
function uint8ArrayToBase64url(arr: Uint8Array): string {
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Import VAPID private key (base64url-encoded raw P-256 scalar) */
async function importVapidPrivateKey(privateKeyBase64url: string): Promise<CryptoKey> {
  const raw = base64urlToUint8Array(privateKeyBase64url);
  const jwk = {
    kty: "EC",
    crv: "P-256",
    d: uint8ArrayToBase64url(raw),
    // We'll derive x,y from signing — but actually need them for JWK import
    // Use a dummy approach: import as PKCS8 instead
  };
  // For ECDSA with Web Crypto, we need the full JWK (x, y, d)
  // Alternative: construct PKCS8 DER from raw private key
  const pkcs8 = buildPKCS8FromRaw(raw);
  return crypto.subtle.importKey("pkcs8", pkcs8, { name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
}

/** Build PKCS8 DER from raw 32-byte P-256 private key */
function buildPKCS8FromRaw(raw: Uint8Array): ArrayBuffer {
  // PKCS8 wrapping for EC P-256 private key
  const prefix = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
    0x01, 0x01, 0x04, 0x20
  ]);
  const suffix = new Uint8Array([
    0xa1, 0x44, 0x03, 0x42, 0x00
  ]);
  // We need the public key point here - derive it
  // Actually, we can omit the public key in PKCS8 for import
  // Simpler: use a minimal ECPrivateKey without public key
  const ecPrivateKey = new Uint8Array([
    0x30, 0x77, 0x02, 0x01, 0x01, 0x04, 0x20,
    ...raw,
    0xa0, 0x0a, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce,
    0x3d, 0x03, 0x01, 0x07
  ]);
  // PKCS8 wrapper
  const pkcs8Prefix = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d
  ]);
  const result = new Uint8Array(pkcs8Prefix.length + ecPrivateKey.length);
  result.set(pkcs8Prefix);
  result.set(ecPrivateKey, pkcs8Prefix.length);
  return result.buffer;
}

/** Import VAPID public key (base64url-encoded uncompressed P-256 point, 65 bytes) */
async function importVapidPublicKey(publicKeyBase64url: string): Promise<CryptoKey> {
  const raw = base64urlToUint8Array(publicKeyBase64url);
  return crypto.subtle.importKey("raw", raw, { name: "ECDSA", namedCurve: "P-256" }, true, ["verify"]);
}

/** Create VAPID Authorization header (JWT) */
async function createVapidAuthHeader(
  endpoint: string,
  privateKey: CryptoKey,
  publicKeyBase64url: string,
  email: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const audience = new URL(endpoint).origin;
  const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12h

  const header = { typ: "JWT", alg: "ES256" };
  const payload = { aud: audience, exp: expiration, sub: email };

  const headerB64 = uint8ArrayToBase64url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s (64 bytes)
  const rawSig = derToRaw(new Uint8Array(signature));
  const signatureB64 = uint8ArrayToBase64url(rawSig);

  return {
    authorization: `vapid t=${unsignedToken}.${signatureB64}, k=${publicKeyBase64url}`,
    cryptoKey: `p256ecdsa=${publicKeyBase64url}`
  };
}

/** Convert DER ECDSA signature to raw 64-byte format */
function derToRaw(der: Uint8Array): Uint8Array {
  // DER: 0x30 [len] 0x02 [rLen] [r] 0x02 [sLen] [s]
  const raw = new Uint8Array(64);
  let offset = 2; // skip 0x30 and length

  // r
  const rLen = der[offset + 1];
  offset += 2;
  const rStart = rLen > 32 ? offset + (rLen - 32) : offset;
  const rDest = rLen > 32 ? 0 : 32 - rLen;
  raw.set(der.slice(rStart, offset + rLen), rDest);
  offset += rLen;

  // s
  const sLen = der[offset + 1];
  offset += 2;
  const sStart = sLen > 32 ? offset + (sLen - 32) : offset;
  const sDest = sLen > 32 ? 32 : 64 - sLen;
  raw.set(der.slice(sStart, offset + sLen), sDest);

  return raw;
}

/** Encrypt push message payload using RFC 8291 (aes128gcm) */
async function encryptPayload(
  subscription: PushSubscription,
  payload: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const clientPublicKeyBytes = base64urlToUint8Array(subscription.keys.p256dh);
  const authSecret = base64urlToUint8Array(subscription.keys.auth);

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const localPublicKey = new Uint8Array(await crypto.subtle.exportKey("raw", localKeyPair.publicKey));

  // Import client public key
  const clientPublicKey = await crypto.subtle.importKey(
    "raw", clientPublicKeyBytes, { name: "ECDH", namedCurve: "P-256" }, false, []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: clientPublicKey }, localKeyPair.privateKey, 256)
  );

  // Salt (16 random bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF to derive IKM
  const authInfo = new TextEncoder().encode("WebPush: info\x00");
  const authInfoFull = new Uint8Array(authInfo.length + clientPublicKeyBytes.length + localPublicKey.length);
  authInfoFull.set(authInfo);
  authInfoFull.set(clientPublicKeyBytes, authInfo.length);
  authInfoFull.set(localPublicKey, authInfo.length + clientPublicKeyBytes.length);

  const prkKey = await crypto.subtle.importKey("raw", authSecret, { name: "HKDF" }, false, ["deriveBits"]);
  // Actually HKDF needs the shared secret as input keying material
  // Step 1: PRK = HKDF-Extract(auth_secret, ecdh_secret)
  const prkHmacKey = await crypto.subtle.importKey("raw", authSecret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", prkHmacKey, sharedSecret));

  // Step 2: IKM = HKDF-Expand(PRK, "WebPush: info\0" || client_public || server_public, 32)
  const ikm = await hkdfExpand(prk, authInfoFull, 32);

  // Step 3: Derive content encryption key and nonce using salt
  const saltHmacKey = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prkForContent = new Uint8Array(await crypto.subtle.sign("HMAC", saltHmacKey, ikm));

  const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\x00");
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\x00");

  const contentEncryptionKey = await hkdfExpand(prkForContent, cekInfo, 16);
  const nonce = await hkdfExpand(prkForContent, nonceInfo, 12);

  // Encrypt with AES-128-GCM
  const paddedPayload = new Uint8Array(new TextEncoder().encode(payload).length + 1);
  paddedPayload.set(new TextEncoder().encode(payload));
  paddedPayload[paddedPayload.length - 1] = 2; // padding delimiter

  const aesKey = await crypto.subtle.importKey("raw", contentEncryptionKey, { name: "AES-GCM" }, false, ["encrypt"]);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, paddedPayload)
  );

  // Build aes128gcm payload: salt(16) || rs(4) || idlen(1) || keyid(65) || ciphertext
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, encrypted.length + 86); // rs = header + content
  const header = new Uint8Array(86);
  header.set(salt, 0);
  header.set(recordSize, 16);
  header[20] = 65; // idlen = 65 (uncompressed P-256 point)
  header.set(localPublicKey, 21);

  const ciphertext = new Uint8Array(header.length + encrypted.length);
  ciphertext.set(header);
  ciphertext.set(encrypted, header.length);

  return { ciphertext, salt, localPublicKey };
}

/** HKDF-Expand (SHA-256) */
async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const hmacKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const infoWithCounter = new Uint8Array(info.length + 1);
  infoWithCounter.set(info);
  infoWithCounter[info.length] = 1;
  const result = new Uint8Array(await crypto.subtle.sign("HMAC", hmacKey, infoWithCounter));
  return result.slice(0, length);
}

/** Send a single Web Push notification */
async function sendPushNotification(
  subscription: PushSubscription,
  payload: string,
  vapidPrivateKey: CryptoKey,
  vapidPublicKeyBase64url: string,
  vapidEmail: string
): Promise<{ success: boolean; statusCode?: number }> {
  try {
    const { ciphertext } = await encryptPayload(subscription, payload);
    const { authorization } = await createVapidAuthHeader(
      subscription.endpoint, vapidPrivateKey, vapidPublicKeyBase64url, vapidEmail
    );

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Authorization": authorization,
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        "TTL": "86400",
        "Urgency": "high",
      },
      body: ciphertext,
    });

    return { success: response.ok, statusCode: response.status };
  } catch (e) {
    console.error("Push send error:", e);
    return { success: false, statusCode: 0 };
  }
}

// ============================================================
// Reminder logic (ported from reminder-notify.js)
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
  // 15分ウィンドウに拡大（GitHub Actions遅延対策 → Edge Functionでは5分で十分だが安全マージン）
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
      const sevenDaysBeforeStr = formatDateStr(sevenDaysBefore);
      if (dateStr < sevenDaysBeforeStr || dateStr > r.event_date) return false;
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
      const m = parseInt(r.event_date!.split("-")[1], 10);
      const d = parseInt(r.event_date!.split("-")[2], 10);
      msg += `• [${r.child_name}] ${r.message}（あと${days}日 - ${m}/${d}）\n`;
    });
  }
  return msg.trim();
}

// ============================================================
// JST time helper
// ============================================================

function getCurrentJST(): { dateStr: string; timeStr: string } {
  const now = new Date();
  // UTC+9
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const mo = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  const h = String(jst.getUTCHours()).padStart(2, "0");
  const mi = String(jst.getUTCMinutes()).padStart(2, "0");
  return { dateStr: `${y}-${mo}-${d}`, timeStr: `${h}:${mi}` };
}

// ============================================================
// Supabase helpers
// ============================================================

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
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
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

serve(async (req: Request) => {
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

    const vapidPrivateKey = await importVapidPrivateKey(VAPID_PRIVATE_KEY);
    const now = getCurrentJST();
    console.log(`JST: ${now.dateStr} ${now.timeStr}`);

    const results: string[] = [];

    // ---- Part 1: Reminder notifications ----
    const reminders: Reminder[] = await supabaseGet(SUPABASE_URL, SUPABASE_KEY, "reminders?deleted_at=is.null&select=*");
    const due = filterDueReminders(reminders, now);
    results.push(`Reminders: ${reminders.length} total, ${due.length} due`);

    if (due.length > 0) {
      // Discord
      if (DISCORD_WEBHOOK) {
        const message = formatDiscordMessage(due, now.dateStr);
        await fetch(DISCORD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: message }),
        });
        results.push("Discord: sent");
      }

      // Web Push to admin
      if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
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
          const pushResults = await sendToSubscriptions(adminSubs, payload, vapidPrivateKey, VAPID_PUBLIC_KEY, VAPID_EMAIL, SUPABASE_URL, SUPABASE_KEY);
          results.push(`Push(admin): ${pushResults.sent}/${adminSubs.length} sent`);
        }
      }
    }

    // ---- Part 2: push_messages queue processing ----
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
        await sendToSubscriptions(subs, payload, vapidPrivateKey, VAPID_PUBLIC_KEY, VAPID_EMAIL, SUPABASE_URL, SUPABASE_KEY);
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

/** Send push to all subscriptions, clean up expired ones */
async function sendToSubscriptions(
  subs: PushSubscriptionRow[],
  payload: string,
  vapidPrivateKey: CryptoKey,
  vapidPublicKey: string,
  vapidEmail: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ sent: number; expired: number }> {
  let sent = 0;
  const expiredIds: string[] = [];

  for (const sub of subs) {
    const result = await sendPushNotification(sub.subscription, payload, vapidPrivateKey, vapidPublicKey, vapidEmail);
    if (result.success) {
      sent++;
    } else if (result.statusCode === 410 || result.statusCode === 404) {
      expiredIds.push(sub.id);
    } else {
      console.error(`Push failed for ${sub.device_id}: status ${result.statusCode}`);
    }
  }

  // Clean up expired subscriptions
  for (const id of expiredIds) {
    await supabaseDelete(supabaseUrl, supabaseKey, `push_subscriptions?id=eq.${id}`);
  }

  return { sent, expired: expiredIds.length };
}
