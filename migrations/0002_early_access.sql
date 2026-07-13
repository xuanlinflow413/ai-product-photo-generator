CREATE TABLE IF NOT EXISTS early_access_leads (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('seller', 'undecided')),
  use_case TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS early_access_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL CHECK (request_count >= 1),
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_early_access_rate_limits_expiry
  ON early_access_rate_limits(expires_at);