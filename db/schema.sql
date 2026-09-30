CREATE TABLE IF NOT EXISTS guestbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 30),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS guestbook_entries_created_idx ON guestbook_entries(created_at DESC, id DESC);
CREATE TABLE IF NOT EXISTS guestbook_rate_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);
