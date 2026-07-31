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
