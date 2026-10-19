CREATE TABLE IF NOT EXISTS public_observation (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  observed_at TEXT NOT NULL,
  published_at TEXT NOT NULL,
  run_alias TEXT NOT NULL,
  payload TEXT NOT NULL CHECK (length(payload) <= 4096)
);
