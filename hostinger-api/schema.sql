CREATE TABLE IF NOT EXISTS webhook_events (
  webhook_id VARCHAR(160) NOT NULL PRIMARY KEY,
  event_type VARCHAR(120) NOT NULL,
  payload_json JSON NOT NULL,
  received_at DATETIME NOT NULL,
  INDEX idx_webhook_received (received_at),
  INDEX idx_webhook_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dodo_customer_id VARCHAR(120) NULL UNIQUE,
  email VARCHAR(254) NULL,
  full_name VARCHAR(180) NULL,
  country_code VARCHAR(8) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_customer_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dodo_payment_id VARCHAR(120) NOT NULL UNIQUE,
  dodo_customer_id VARCHAR(120) NULL,
  customer_email VARCHAR(254) NULL,
  amount_minor BIGINT NULL,
  currency VARCHAR(8) NULL,
  status VARCHAR(60) NULL,
  event_type VARCHAR(120) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_payment_customer (dodo_customer_id),
  INDEX idx_payment_email (customer_email),
  INDEX idx_payment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS licences (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dodo_licence_id VARCHAR(160) NOT NULL UNIQUE,
  dodo_payment_id VARCHAR(120) NULL,
  customer_email VARCHAR(254) NULL,
  key_last_four VARCHAR(12) NULL,
  status VARCHAR(60) NULL,
  event_type VARCHAR(120) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_licence_payment (dodo_payment_id),
  INDEX idx_licence_email (customer_email),
  INDEX idx_licence_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Website accounts. Downloads are gated behind a sign in, and the Pro
-- installer additionally requires the account email to match a paid Dodo
-- record. Nothing here writes to payments or licences: the billing tables are
-- read only from the account code.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  -- password_hash() output. A plaintext password is never stored or logged.
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(180) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  last_login_at DATETIME NULL,
  failed_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  INDEX idx_users_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  -- SHA-256 of the cookie value. The cookie itself is never stored, so a
  -- database leak cannot be replayed as a login.
  token_hash CHAR(64) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  last_seen_at DATETIME NOT NULL,
  ip_hash CHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_expiry (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS download_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  edition VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL,
  ip_hash CHAR(64) NULL,
  INDEX idx_downloads_user (user_id),
  INDEX idx_downloads_created (created_at),
  CONSTRAINT fk_downloads_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_throttle (
  bucket VARCHAR(190) NOT NULL PRIMARY KEY,
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  window_start DATETIME NOT NULL,
  INDEX idx_throttle_window (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
