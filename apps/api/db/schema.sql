CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  track TEXT NOT NULL,
  title TEXT NOT NULL,
  target_user TEXT NOT NULL,
  problem TEXT NOT NULL,
  current_solution TEXT NOT NULL DEFAULT '',
  evidence TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  analysis_status TEXT NOT NULL DEFAULT 'pending',
  analysis JSONB,
  analysis_message TEXT
);
