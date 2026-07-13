CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'free',
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  plan_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_checkout_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  amount_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS export_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'completed', 'failed', 'refunded')),
  credit_delta INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE (user_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_exports_user ON export_jobs(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS early_access_leads (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('seller', 'undecided')),
  use_case TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL,
  created_at TEXT NOT NULL
);