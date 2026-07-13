import assert from "node:assert/strict";
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
  constructor() { this.users = new Map(); this.orders = new Map(); this.events = new Map(); this.exports = new Map(); }
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
    throw new Error(`Unhandled SQL: ${sql}`);
  }
}

const makeEnv = (overrides = {}) => ({ DB: new MemoryD1(), SESSION_SECRET: "test-session-secret", WEBHOOK_SECRET: "test-webhook-secret", AUTH_MODE: "development", PAYMENT_PROVIDER: "unconfigured", ASSETS: { fetch: () => new Response("asset-ok") }, ...overrides });
const call = (env, path, init = {}) => worker.fetch(new Request(`http://localhost${path}`, init), env);
const body = (value) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(value) });

async function login(env) {
  const response = await call(env, "/api/auth/dev-login", body({ email: "developer@example.test" }));
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie").split(";")[0];
}

test("protected account rejects anonymous access", async () => {
  const response = await call(makeEnv(), "/api/account");
  assert.equal(response.status, 401);
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
