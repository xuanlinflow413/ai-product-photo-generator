CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('text_edit', 'ai_edit', 'marketplace', 'other')),
  message TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  page_path TEXT NOT NULL DEFAULT '/',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);

CREATE TABLE IF NOT EXISTS feedback_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL CHECK (request_count >= 1),
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feedback_rate_limits_expiry
  ON feedback_rate_limits(expires_at);
