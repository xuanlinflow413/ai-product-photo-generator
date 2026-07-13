import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import worker from "../public/_worker.js";
import { signWebhook } from "../public/shared/billing-core.mjs";

class Statement {
  constructor(db, sql) { this.db = db; this.sql = sql; this.values = []; }
  bind(...values) { this.values = values; return this; }
  first() { return this.db.execute(this.sql, this.values, true); }
  all() { return Promise.resolve({ results: this.db.execute(this.sql, this.values, false) }); }
  run() { return Promise.resolve({ meta: { changes: this.db.execute(this.sql, this.values, false) } }); }
}

class MemoryD1 {
  constructor() { this.users = new Map(); this.orders = new Map(); this.events = new Map(); this.exports = new Map(); this.leads = new Map(); this.rateLimits = new Map(); }
  prepare(sql) { return new Statement(this, sql); }
  async batch(statements) { for (const statement of statements) await statement.run(); }
  execute(sql, values) {
    if (sql.startsWith("INSERT INTO users")) {
      if (!this.users.has(values[0])) this.users.set(values[0], { id: values[0], email: values[1], plan_id: "free", credits: 0, created_at: values[2] });
      return 1;
    }
    if (sql.startsWith("SELECT id,email,plan_id,credits FROM users")) return this.users.get(values[0]) ?? null;
    if (sql.startsWith("SELECT email,plan_id,credits FROM users")) return this.users.get(values[0]) ?? null;
    if (sql.startsWith("SELECT id,plan_id,status,amount_cents,created_at FROM orders")) return [...this.orders.values()].filter((x) => x.user_id === values[0]);
    if (sql.startsWith("SELECT id,status,credit_delta,created_at FROM export_jobs")) return [...this.exports.values()].filter((x) => x.user_id === values[0]);
    if (sql.startsWith("INSERT INTO orders")) {
      this.orders.set(values[0], { id: values[0], user_id: values[1], plan_id: values[2], provider: "mock", provider_checkout_id: values[3], status: "pending", amount_cents: values[4], created_at: values[5] }); return 1;
    }
    if (sql.startsWith("SELECT id FROM webhook_events")) return this.events.get(values[0]) ?? null;
    if (sql.startsWith("SELECT user_id,plan_id,status FROM orders")) return this.orders.get(values[0]) ?? null;
    if (sql.startsWith("INSERT INTO webhook_events")) { this.events.set(values[0], { id: values[0] }); return 1; }
    if (sql.startsWith("UPDATE orders SET status='paid'")) { const order = this.orders.get(values[0]); if (order?.status === "pending") { order.status = "paid"; return 1; } return 0; }
    if (sql.startsWith("UPDATE users SET credits=credits+?")) { const user = this.users.get(values[2]); user.credits += values[0]; user.plan_id = values[1]; return 1; }
    if (sql.startsWith("SELECT id,status,credit_delta FROM export_jobs")) return [...this.exports.values()].find((x) => x.user_id === values[0] && x.idempotency_key === values[1]) ?? null;
    if (sql.startsWith("UPDATE users SET credits=credits-1")) { const user = this.users.get(values[0]); if (user.credits < 1) return 0; user.credits -= 1; return 1; }
    if (sql.startsWith("UPDATE users SET credits=credits+1")) { this.users.get(values[0]).credits += 1; return 1; }
    if (sql.startsWith("INSERT INTO export_jobs")) { this.exports.set(values[0], { id: values[0], user_id: values[1], idempotency_key: values[2], status: sql.includes("'completed'") ? "completed" : "failed", credit_delta: sql.includes("-1") ? -1 : 0, created_at: values[3] }); return 1; }
    if (sql.startsWith("INSERT INTO early_access_leads")) {
      const existing = this.leads.get(values[1]);
      this.leads.set(values[1], { id: existing?.id ?? values[0], email: values[1], plan_id: values[2], use_case: values[3], source: values[4], created_at: existing?.created_at ?? values[5] });
      return 1;
    }
    if (sql.startsWith("INSERT INTO early_access_rate_limits")) {
      const count = (this.rateLimits.get(values[0])?.request_count ?? 0) + 1;
      const bucket = { request_count: count, expires_at: values[1] };
      this.rateLimits.set(values[0], bucket);
      return bucket;
    }
    if (sql.startsWith("DELETE FROM early_access_rate_limits")) {
      for (const [key, bucket] of this.rateLimits) if (bucket.expires_at < values[0]) this.rateLimits.delete(key);
      return 1;
    }
    throw new Error(`Unhandled SQL: ${sql}`);
  }
}

const makeEnv = (overrides = {}) => ({ DB: new MemoryD1(), SESSION_SECRET: "test-session-secret", WEBHOOK_SECRET: "test-webhook-secret", AUTH_MODE: "development", PAYMENT_PROVIDER: "unconfigured", ASSETS: { fetch: () => new Response("asset-ok") }, ...overrides });
const call = (env, path, init = {}) => worker.fetch(new Request(`http://localhost${path}`, init), env);
const body = (value, headers = {}) => ({ method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.10", ...headers }, body: JSON.stringify(value) });
const lead = (overrides = {}) => ({ email: "seller@example.com", plan: "seller", useCase: "Weekly marketplace batches", company: "", website: "", ...overrides });

async function login(env) {
  const response = await call(env, "/api/auth/dev-login", body({ email: "developer@example.test" }));
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie").split(";")[0];
}

test("protected account rejects anonymous access", async () => {
  const response = await call(makeEnv(), "/api/account");
  assert.equal(response.status, 401);
});

test("early access signup persists a valid purchase intent without authentication", async () => {
  const env = makeEnv();
  const first = await call(env, "/api/early-access", body(lead({ email: " Seller@Example.com " })));
  assert.equal(first.status, 201);
  assert.equal(env.DB.leads.get("seller@example.com").plan_id, "seller");
  assert.equal(env.DB.leads.get("seller@example.com").use_case, "Weekly marketplace batches");
});

test("early access signup rejects an invalid email", async () => {
  const response = await call(makeEnv(), "/api/early-access", body(lead({ email: "not-an-email" })));
  assert.equal(response.status, 400);
});

test("early access signup upserts a duplicate email", async () => {
  const env = makeEnv();
  assert.equal((await call(env, "/api/early-access", body(lead()))).status, 201);
  assert.equal((await call(env, "/api/early-access", body(lead({ plan: "undecided", useCase: "High-resolution exports" })))).status, 201);
  assert.equal(env.DB.leads.size, 1);
  assert.equal(env.DB.leads.get("seller@example.com").plan_id, "undecided");
  assert.equal(env.DB.leads.get("seller@example.com").use_case, "High-resolution exports");
});

test("early access signup fails closed without a database binding", async () => {
  const response = await call(makeEnv({ DB: undefined }), "/api/early-access", body(lead()));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "SIGNUP_UNAVAILABLE");
});

test("early access signup accepts honeypot bots without writing", async () => {
  const env = makeEnv();
  const response = await call(env, "/api/early-access", body(lead({ website: "https://spam.example" })));
  assert.equal(response.status, 202);
  assert.equal(env.DB.leads.size, 0);
  assert.equal(env.DB.rateLimits.size, 0);
});

test("early access signup rate limits the sixth request from one Cloudflare IP", async () => {
  const env = makeEnv();
  for (let index = 0; index < 5; index += 1) {
    const response = await call(env, "/api/early-access", body(lead({ email: `seller${index}@example.com` })));
    assert.equal(response.status, 201);
  }
  const limited = await call(env, "/api/early-access", body(lead({ email: "seller5@example.com" })));
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get("retry-after")) > 0);
  assert.equal(env.DB.leads.size, 5);
});

test("early access signup fails closed without Cloudflare client identity", async () => {
  const response = await call(makeEnv(), "/api/early-access", body(lead(), { "cf-connecting-ip": "" }));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "SIGNUP_UNAVAILABLE");
});

test("early access signup rejects oversized and non-JSON bodies", async () => {
  const env = makeEnv();
  const oversized = await call(env, "/api/early-access", body(lead({ useCase: "x".repeat(2100) })));
  assert.equal(oversized.status, 413);
  const nonJson = await call(env, "/api/early-access", { method: "POST", headers: { "content-type": "text/plain", "cf-connecting-ip": "203.0.113.10" }, body: "hello" });
  assert.equal(nonJson.status, 415);
});

test("analytics accepts an allowlisted conversion event without authentication", async () => {
  const event = {
    name: "text_editor_export",
    properties: { page_path: "/edit-text-in-product-image/", format: "png", result: "success" },
  };
  const response = await call(makeEnv(), "/api/analytics/events", body(event));
  assert.equal(response.status, 202);
  assert.equal(response.headers.get("x-analytics-event"), event.name);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("analytics accepts the application/json content type sent by sendBeacon", async () => {
  const event = {
    name: "marketplace_zip_export",
    properties: { page_path: "/marketplace-image-fixer/", platform_selection: "amazon_etsy", file_count_bucket: "2_5", result: "success" },
  };
  const response = await call(makeEnv(), "/api/analytics/events", {
    method: "POST",
    headers: { "content-type": "application/json;charset=UTF-8" },
    body: JSON.stringify(event),
  });
  assert.equal(response.status, 202);
});

test("analytics rejects unknown, extra, and sensitive event properties", async () => {
  const env = makeEnv();
  const unknown = await call(env, "/api/analytics/events", body({ name: "arbitrary_event", properties: {} }));
  assert.equal(unknown.status, 400);
  const filename = await call(env, "/api/analytics/events", body({
    name: "text_editor_file_selected",
    properties: { page_path: "/edit-text-in-product-image/", file_count_bucket: "1", result: "success", filename: "private-product.jpg" },
  }));
  assert.equal(filename.status, 400);
  const email = await call(env, "/api/analytics/events", body({
    name: "early_access_submit",
    properties: { page_path: "/", result: "success", email: "seller@example.com" },
  }));
  assert.equal(email.status, 400);
});

test("analytics rejects invalid enum values, oversized bodies, and non-JSON requests", async () => {
  const env = makeEnv();
  const query = await call(env, "/api/analytics/events", body({
    name: "seo_primary_cta_click",
    properties: { page_path: "/replace-text-on-product-image/?email=private", source_page: "direct", cta_id: "guide_hero_editor" },
  }));
  assert.equal(query.status, 400);
  const oversized = await call(env, "/api/analytics/events", body({ name: "x".repeat(1100), properties: {} }));
  assert.equal(oversized.status, 413);
  const nonJson = await call(env, "/api/analytics/events", { method: "POST", headers: { "content-type": "text/plain" }, body: "hello" });
  assert.equal(nonJson.status, 415);
});

test("analytics endpoint allows only POST", async () => {
  const response = await call(makeEnv(), "/api/analytics/events");
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
});

test("0002 migration applies after 0001 without losing existing billing data", async () => {
  const db = new DatabaseSync(":memory:");
  const migration1 = await readFile(new URL("../migrations/0001_billing.sql", import.meta.url), "utf8");
  const migration2 = await readFile(new URL("../migrations/0002_early_access.sql", import.meta.url), "utf8");
  db.exec(migration1);
  db.prepare("INSERT INTO users(id,email,created_at) VALUES(?,?,?)").run("existing-user", "existing@example.com", "2026-07-13T00:00:00.000Z");
  db.exec(migration2);
  assert.equal(db.prepare("SELECT email FROM users WHERE id=?").get("existing-user").email, "existing@example.com");
  assert.deepEqual(
    db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('early_access_leads','early_access_rate_limits') ORDER BY name").all().map((row) => row.name),
    ["early_access_leads", "early_access_rate_limits"],
  );
  db.close();
});

test("disabled auth mode rejects development login on localhost", async () => {
  const response = await call(makeEnv({ AUTH_MODE: "disabled" }), "/api/auth/dev-login", body({ email: "attacker@example.test" }));
  assert.equal(response.status, 404);
});

test("non-local hosts reject development login even when auth mode is development", async () => {
  const response = await worker.fetch(new Request("https://example.test/api/auth/dev-login", body({ email: "attacker@example.test" })), makeEnv());
  assert.equal(response.status, 404);
});

test("development login restores session and logout clears it", async () => {
  const env = makeEnv();
  const cookie = await login(env);
  const session = await call(env, "/api/auth/session", { headers: { cookie } });
  assert.equal((await session.json()).authenticated, true);
  const logout = await call(env, "/api/auth/logout", { method: "POST", headers: { cookie } });
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
});

test("checkout rejects anonymous and reports unavailable provider", async () => {
  const env = makeEnv();
  assert.equal((await call(env, "/api/checkout", body({ planId: "starter" }))).status, 401);
  const cookie = await login(env);
  const response = await call(env, "/api/checkout", { ...body({ planId: "starter" }), headers: { "content-type": "application/json", cookie } });
  assert.equal(response.status, 503);
});

test("signed webhook grants credits once and invalid signature is rejected", async () => {
  const env = makeEnv({ PAYMENT_PROVIDER: "mock" });
  const cookie = await login(env);
  const checkout = await call(env, "/api/checkout", { ...body({ planId: "starter" }), headers: { "content-type": "application/json", cookie } });
  const { orderId } = await checkout.json();
  const event = JSON.stringify({ id: "evt_1", type: "checkout.completed", data: { orderId, planId: "starter" } });
  const invalid = await call(env, "/api/webhooks/payment", { method: "POST", headers: { "x-webhook-signature": "bad" }, body: event });
  assert.equal(invalid.status, 401);
  const signature = await signWebhook(event, env.WEBHOOK_SECRET);
  const init = { method: "POST", headers: { "x-webhook-signature": signature }, body: event };
  assert.equal((await call(env, "/api/webhooks/payment", init)).status, 200);
  assert.equal((await (await call(env, "/api/webhooks/payment", init)).json()).idempotent, true);
  assert.equal([...env.DB.users.values()][0].credits, 50);
});

test("failed export costs zero and completed export is idempotent", async () => {
  const env = makeEnv();
  const cookie = await login(env);
  const user = [...env.DB.users.values()][0]; user.credits = 2;
  const options = (value) => ({ ...body(value), headers: { "content-type": "application/json", cookie } });
  assert.equal((await call(env, "/api/exports/fail", options({ idempotencyKey: "failed-zip" }))).status, 201);
  assert.equal(user.credits, 2);
  assert.equal((await call(env, "/api/exports/complete", options({ idempotencyKey: "good-zip" }))).status, 201);
  assert.equal((await (await call(env, "/api/exports/complete", options({ idempotencyKey: "good-zip" }))).json()).idempotent, true);
  assert.equal(user.credits, 1);
});
