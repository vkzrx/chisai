DROP TABLE IF EXISTS urls;

CREATE TABLE IF NOT EXISTS urls (
  id INTEGER PRIMARY KEY,
  original TEXT,
  shorten TEXT UNIQUE,
  clicks INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

CREATE INDEX IF NOT EXISTS urls_shorten_index ON urls (shorten);
