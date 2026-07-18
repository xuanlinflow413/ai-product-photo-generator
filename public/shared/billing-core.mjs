import {
  EDITIMAGES_PLANS,
  toApiPlan,
} from "../../shared/editimages-plans.mjs";

const encoder = new TextEncoder();

function base64Url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return base64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export const PLANS = EDITIMAGES_PLANS.map((plan) => ({
  id: plan.id,
  name: plan.name,
  priceCents: plan.priceCents,
  credits: plan.credits,
  billingInterval: plan.billingInterval,
  checkoutMode: plan.checkoutMode,
}));

export const PUBLIC_PLANS = EDITIMAGES_PLANS.map(toApiPlan);

export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
});

export async function signSession(user, secret, now = Date.now()) {
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  const payload = base64Url(encoder.encode(JSON.stringify({ ...user, exp: now + 86_400_000 })));
  return `${payload}.${await hmac(payload, secret)}`;
}

export async function verifySession(token, secret, now = Date.now()) {
  if (!token || !secret) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !timingSafeEqual(await hmac(payload, secret), signature)) return null;
  try {
    const padded = payload.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const value = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))));
    return value.exp > now ? value : null;
  } catch {
    return null;
  }
}

export const sessionToken = (request) => request.headers.get("cookie")?.match(/(?:^|;\s*)app_session=([^;]+)/)?.[1];
export const sessionCookie = (value, secure = false) => `app_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secure ? "; Secure" : ""}`;
export const clearSessionCookie = () => "app_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";

export async function signWebhook(rawBody, secret) {
  if (!secret) throw new Error("WEBHOOK_SECRET is not configured");
  return hmac(rawBody, secret);
}

export async function verifyWebhook(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  return timingSafeEqual(await hmac(rawBody, secret), signature);
}
