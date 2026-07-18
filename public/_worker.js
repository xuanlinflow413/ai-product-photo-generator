import {
  PLANS,
  PUBLIC_PLANS,
  clearSessionCookie,
  json,
  sessionCookie,
  sessionToken,
  signSession,
  verifySession,
  verifyWebhook,
} from "./shared/billing-core.mjs";

const now = () => new Date().toISOString();
const first = (env, sql, ...bindings) => env.DB.prepare(sql).bind(...bindings).first();
const many = (env, sql, ...bindings) => env.DB.prepare(sql).bind(...bindings).all();
const EARLY_ACCESS_BODY_LIMIT = 2048;
const EARLY_ACCESS_RATE_LIMIT = 5;
const EARLY_ACCESS_RATE_WINDOW_SECONDS = 60 * 60;
const ANALYTICS_BODY_LIMIT = 1024;
const BILLING_ORIGIN = "https://auth.editimages.app";
const BILLING_ROUTES = new Map([
  ["/api/auth/google", "/api/auth/google"],
  ["/api/auth/session", "/api/auth/session"],
  ["/api/auth/exchange", "/api/auth/exchange"],
  ["/api/auth/logout", "/api/auth/logout"],
  ["/api/plans", "/api/billing/plans"],
  ["/api/checkout", "/api/billing/checkout"],
  ["/api/billing/portal", "/api/billing/portal"],
  ["/api/images/edit", "/api/images/edit"],
]);

const analyticsContracts = {
  seo_primary_cta_click: {
    required: ["page_path", "source_page", "cta_id"],
    values: {
      page_path: ["/", "/replace-text-on-product-image/"],
      source_page: ["/", "/replace-text-on-product-image/", "direct"],
      cta_id: ["guide_hero_editor", "guide_final_editor", "pricing_free_tools", "pricing_subscribe"],
    },
  },
  text_editor_file_selected: {
    required: ["page_path", "file_count_bucket", "result"],
    values: { page_path: ["/edit-text-in-product-image/"], file_count_bucket: ["1"], result: ["success"] },
  },
  text_editor_export: {
    required: ["page_path", "format", "result"],
    values: { page_path: ["/edit-text-in-product-image/"], format: ["png", "jpg"], result: ["success"] },
  },
  marketplace_files_selected: {
    required: ["page_path", "file_count_bucket", "result"],
    values: { page_path: ["/marketplace-image-fixer/"], file_count_bucket: ["1", "2_5", "6_10", "11_25"], result: ["success"] },
  },
  marketplace_pack_prepared: {
    required: ["page_path", "platform_selection", "file_count_bucket", "result"],
    values: {
      page_path: ["/marketplace-image-fixer/"],
      platform_selection: ["amazon", "etsy", "ebay", "amazon_etsy", "amazon_ebay", "etsy_ebay", "amazon_etsy_ebay"],
      file_count_bucket: ["1", "2_5", "6_10", "11_25"],
      result: ["success"],
    },
  },
  marketplace_zip_export: {
    required: ["page_path", "platform_selection", "file_count_bucket", "result"],
    values: {
      page_path: ["/marketplace-image-fixer/"],
      platform_selection: ["amazon", "etsy", "ebay", "amazon_etsy", "amazon_ebay", "etsy_ebay", "amazon_etsy_ebay"],
      file_count_bucket: ["1", "2_5", "6_10", "11_25"],
      result: ["success"],
    },
  },
  early_access_submit: {
    required: ["page_path", "result"],
    values: { page_path: ["/"], result: ["success"] },
  },
};

async function session(request, env) {
  return verifySession(sessionToken(request), env.SESSION_SECRET);
}

async function requireSession(request, env) {
  const value = await session(request, env);
  return value ? { value } : { response: json({ error: "Authentication required" }, 401) };
}

async function parseObject(request) {
  const body = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid JSON body");
  return body;
}

async function earlyAccessBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return { response: json({ error: "JSON body required" }, 415) };
  }
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > EARLY_ACCESS_BODY_LIMIT) {
    return { response: json({ error: "Request body too large" }, 413) };
  }
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > EARLY_ACCESS_BODY_LIMIT) {
    return { response: json({ error: "Request body too large" }, 413) };
  }
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return { response: json({ error: "Invalid JSON body" }, 400) };
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { response: json({ error: "Invalid JSON body" }, 400) };
  }
  return { body };
}

async function earlyAccessRateLimit(request, env) {
  const ip = request.headers.get("cf-connecting-ip")?.trim();
  if (!ip) return json({ error: "Client identity unavailable", code: "SIGNUP_UNAVAILABLE" }, 503);
  const epochSeconds = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(epochSeconds / EARLY_ACCESS_RATE_WINDOW_SECONDS) * EARLY_ACCESS_RATE_WINDOW_SECONDS;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}:${windowStart}`));
  const bucketKey = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const expiresAt = windowStart + EARLY_ACCESS_RATE_WINDOW_SECONDS;
  const bucket = await env.DB.prepare("INSERT INTO early_access_rate_limits(bucket_key,request_count,expires_at) VALUES(?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET request_count=request_count+1 RETURNING request_count")
    .bind(bucketKey, expiresAt).first();
  if (!bucket || bucket.request_count > EARLY_ACCESS_RATE_LIMIT) {
    return json({ error: "Too many requests" }, 429, { "retry-after": String(Math.max(1, expiresAt - epochSeconds)) });
  }
  if (bucket.request_count === 1) {
    await env.DB.prepare("DELETE FROM early_access_rate_limits WHERE bucket_key IN (SELECT bucket_key FROM early_access_rate_limits WHERE expires_at<? LIMIT 20)").bind(epochSeconds).run();
  }
  return null;
}

async function handleEarlyAccess(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, { allow: "POST" });
  if (!env.DB) return json({ error: "Early access signup is not configured", code: "SIGNUP_UNAVAILABLE" }, 503);
  const parsed = await earlyAccessBody(request);
  if (parsed.response) return parsed.response;
  const body = parsed.body;
  if (typeof body.company !== "string" || typeof body.website !== "string") {
    return json({ error: "Invalid form submission" }, 400);
  }
  if (body.company || body.website) return json({ ok: true }, 202);
  const rateLimited = await earlyAccessRateLimit(request, env);
  if (rateLimited) return rateLimited;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const plan = body.plan === "seller" || body.plan === "undecided" ? body.plan : "";
  const useCase = typeof body.useCase === "string" ? body.useCase.trim().slice(0, 500) : "";
  if (!plan || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ error: "Valid email required" }, 400);
  }
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO early_access_leads(id,email,plan_id,use_case,source,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET plan_id=excluded.plan_id,use_case=excluded.use_case,source=excluded.source")
    .bind(id, email, plan, useCase, "homepage_pricing", now()).run();
  return json({ ok: true }, 201);
}

async function handleAnalyticsEvent(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, { allow: "POST" });
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) return json({ error: "JSON body required" }, 415);
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > ANALYTICS_BODY_LIMIT) return json({ error: "Request body too large" }, 413);
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > ANALYTICS_BODY_LIMIT) return json({ error: "Request body too large" }, 413);

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!event || typeof event !== "object" || Array.isArray(event) || typeof event.name !== "string") return json({ error: "Invalid event" }, 400);
  const contract = analyticsContracts[event.name];
  const properties = event.properties;
  if (!contract || !properties || typeof properties !== "object" || Array.isArray(properties)) return json({ error: "Invalid event" }, 400);
  const keys = Object.keys(properties).sort();
  const required = [...contract.required].sort();
  if (keys.length !== required.length || keys.some((key, index) => key !== required[index])) return json({ error: "Invalid event properties" }, 400);
  if (required.some((key) => typeof properties[key] !== "string" || !contract.values[key].includes(properties[key]))) return json({ error: "Invalid event properties" }, 400);

  console.log(JSON.stringify({ type: "conversion_event", name: event.name, properties }));
  return new Response(null, { status: 202, headers: { "cache-control": "no-store", "x-analytics-event": event.name } });
}

function allowsDevelopmentLogin(request, env) {
  if (env.AUTH_MODE !== "development") return false;
  const hostname = new URL(request.url).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

async function proxyBillingRequest(request, env, path) {
  if (env.AUTH_MODE === "development") return null;
  const upstreamPath = BILLING_ROUTES.get(path);
  if (!upstreamPath) return null;
  if (!env.BILLING) {
    return json({ error: "Production account service is unavailable", code: "AUTH_UNAVAILABLE" }, 503);
  }

  const sourceUrl = new URL(request.url);
  const upstreamUrl = new URL(upstreamPath, BILLING_ORIGIN);
  upstreamUrl.search = sourceUrl.search;
  const headers = new Headers(request.headers);
  headers.set("x-forwarded-host", "auth.editimages.app");
  headers.set("x-forwarded-proto", "https");
  headers.delete("host");
  if (path === "/api/images/edit") {
    const declaredLength = Number(headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > 9 * 1024 * 1024) {
      return json({ error: "Request body too large" }, 413);
    }
  }
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  if (path === "/api/images/edit" && body && body.byteLength > 9 * 1024 * 1024) {
    return json({ error: "Request body too large" }, 413);
  }

  return env.BILLING.fetch(new Request(upstreamUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  }));
}

async function handleAuth(request, env, path, url) {
  if (path === "/api/auth/session" && request.method === "GET") {
    const active = await session(request, env);
    if (!active) return json({ authenticated: false });
    const user = await first(env, "SELECT id,email,plan_id,credits FROM users WHERE id=?", active.id);
    return json(user ? { authenticated: true, user } : { authenticated: false });
  }

  if (path === "/api/auth/dev-login" && request.method === "POST") {
    if (!allowsDevelopmentLogin(request, env)) return json({ error: "Development login is disabled" }, 404);
    const body = await parseObject(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return json({ error: "Valid email required" }, 400);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
    const id = `dev_${[...new Uint8Array(digest)].slice(0, 12).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    await env.DB.prepare("INSERT INTO users(id,email,plan_id,credits,created_at) VALUES(?,?,'free',0,?) ON CONFLICT(id) DO NOTHING")
      .bind(id, email, now()).run();
    const token = await signSession({ id, email }, env.SESSION_SECRET);
    return json({ ok: true }, 200, { "set-cookie": sessionCookie(token, url.protocol === "https:") });
  }

  if (path === "/api/auth/logout" && request.method === "POST") {
    return json({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
  }
  return null;
}

async function handleCheckout(request, env, user) {
  if (env.PAYMENT_PROVIDER !== "mock") {
    return json({ error: "Checkout provider is not configured", code: "CHECKOUT_UNAVAILABLE" }, 503);
  }
  const body = await parseObject(request);
  const planId = typeof body.plan_id === "string"
    ? body.plan_id
    : typeof body.planId === "string"
      ? body.planId
      : "";
  const plan = PLANS.find((candidate) => candidate.id === planId);
  if (!plan) return json({ error: "Unknown plan" }, 400);
  const orderId = crypto.randomUUID();
  const checkoutId = `mock_${crypto.randomUUID()}`;
  await env.DB.prepare("INSERT INTO orders(id,user_id,plan_id,provider,provider_checkout_id,status,amount_cents,created_at) VALUES(?,?,?,'mock',?,'pending',?,?)")
    .bind(orderId, user.id, plan.id, checkoutId, plan.priceCents, now()).run();
  return json({
    orderId,
    sessionId: checkoutId,
    url: `https://checkout.stripe.com/c/pay/${checkoutId}`,
    warning: "Development provider only. No money is charged.",
  }, 201);
}

async function handleExport(request, env, user, path) {
  const body = await parseObject(request);
  const key = typeof body.idempotencyKey === "string" ? body.idempotencyKey.trim() : "";
  if (!key || key.length > 120) return json({ error: "Valid idempotencyKey required" }, 400);

  if (path === "/api/exports/complete") {
    const existing = await first(env, "SELECT id,status,credit_delta FROM export_jobs WHERE user_id=? AND idempotency_key=?", user.id, key);
    if (existing) return json({ export: existing, idempotent: true });
    const jobId = crypto.randomUUID();
    const result = await env.DB.prepare("UPDATE users SET credits=credits-1 WHERE id=? AND credits>=1").bind(user.id).run();
    if (result.meta?.changes !== 1) return json({ error: "Insufficient credits" }, 402);
    try {
      await env.DB.prepare("INSERT INTO export_jobs(id,user_id,idempotency_key,status,credit_delta,created_at) VALUES(?,?,?,'completed',-1,?)")
        .bind(jobId, user.id, key, now()).run();
    } catch (error) {
      await env.DB.prepare("UPDATE users SET credits=credits+1 WHERE id=?").bind(user.id).run();
      const raced = await first(env, "SELECT id,status,credit_delta FROM export_jobs WHERE user_id=? AND idempotency_key=?", user.id, key);
      if (raced) return json({ export: raced, idempotent: true });
      throw error;
    }
    return json({ export: { id: jobId, status: "completed", credit_delta: -1 } }, 201);
  }

  if (path === "/api/exports/fail") {
    const existing = await first(env, "SELECT id,status,credit_delta FROM export_jobs WHERE user_id=? AND idempotency_key=?", user.id, key);
    if (existing) return json({ export: existing, idempotent: true });
    const jobId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO export_jobs(id,user_id,idempotency_key,status,credit_delta,created_at) VALUES(?,?,?,'failed',0,?)")
      .bind(jobId, user.id, key, now()).run();
    return json({ export: { id: jobId, status: "failed", credit_delta: 0 } }, 201);
  }
  return null;
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "") || "/";
  if (path === "/api/health") return json({ ok: true, paymentProvider: env.PAYMENT_PROVIDER || "unconfigured" });
  if (path === "/api/early-access") return handleEarlyAccess(request, env);
  if (path === "/api/analytics/events") return handleAnalyticsEvent(request);
  if (path === "/api/plans" && request.method === "GET" && env.AUTH_MODE === "development") {
    return json({ plans: PUBLIC_PLANS });
  }

  const billingResponse = await proxyBillingRequest(request, env, path);
  if (billingResponse) return billingResponse;

  const authResponse = await handleAuth(request, env, path, url);
  if (authResponse) return authResponse;

  const auth = await requireSession(request, env);
  if (auth.response) return auth.response;
  const user = auth.value;

  if (path === "/api/account" && request.method === "GET") {
    const account = await first(env, "SELECT id,email,plan_id,credits FROM users WHERE id=?", user.id);
    const orders = await many(env, "SELECT id,plan_id,status,amount_cents,created_at FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 10", user.id);
    const exports = await many(env, "SELECT id,status,credit_delta,created_at FROM export_jobs WHERE user_id=? ORDER BY created_at DESC LIMIT 10", user.id);
    return json({ account, orders: orders.results, exports: exports.results });
  }
  if (path === "/api/checkout" && request.method === "POST") return handleCheckout(request, env, user);
  if ((path === "/api/exports/complete" || path === "/api/exports/fail") && request.method === "POST") {
    return handleExport(request, env, user, path);
  }
  return json({ error: "Not found" }, 404);
}

async function handleWebhook(request, env) {
  const rawBody = await request.text();
  if (!await verifyWebhook(rawBody, request.headers.get("x-webhook-signature"), env.WEBHOOK_SECRET)) {
    return json({ error: "Invalid signature" }, 401);
  }
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (event.type !== "checkout.completed") return json({ received: true, handled: false });
  if (!event.id || !event.data?.orderId || !event.data?.planId) return json({ error: "Invalid event" }, 400);
  if (await first(env, "SELECT id FROM webhook_events WHERE id=?", event.id)) {
    return json({ received: true, idempotent: true });
  }
  const plan = PLANS.find((candidate) => candidate.id === event.data.planId);
  const order = await first(env, "SELECT user_id,plan_id,status FROM orders WHERE id=?", event.data.orderId);
  if (!plan || !order || order.plan_id !== plan.id) return json({ error: "Order or plan not found" }, 404);
  if (order.status === "paid") return json({ received: true, idempotent: true });
  await env.DB.batch([
    env.DB.prepare("INSERT INTO webhook_events(id,type,created_at) VALUES(?,?,?)").bind(event.id, event.type, now()),
    env.DB.prepare("UPDATE orders SET status='paid' WHERE id=? AND status='pending'").bind(event.data.orderId),
    env.DB.prepare("UPDATE users SET credits=credits+?,plan_id=? WHERE id=?").bind(plan.credits, plan.id, order.user_id),
  ]);
  return json({ received: true, creditsGranted: plan.credits });
}

const worker = {
  async fetch(request, env) {
    const path = new URL(request.url).pathname.replace(/\/$/, "") || "/";
    let response;
    try {
      if (path === "/api/webhooks/payment" && request.method === "POST") response = await handleWebhook(request, env);
      else if (path.startsWith("/api/")) response = await handleApi(request, env);
      else response = await env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      response = json({ error: "Internal error" }, 500);
    }
    const headers = new Headers(response.headers);
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    return new Response(response.body, { status: response.status, headers });
  },
};

export default worker;
