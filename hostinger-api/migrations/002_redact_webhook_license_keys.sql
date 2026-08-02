-- One-time cleanup for entitlement webhooks received before raw licence-key
-- redaction was added to dodo-webhook.php. Run in phpMyAdmin on the MewMuze
-- database before the hardened endpoint is deployed.
UPDATE webhook_events
SET payload_json = JSON_SET(payload_json, '$.data.license_key.key', '[redacted]')
WHERE JSON_EXTRACT(payload_json, '$.data.license_key.key') IS NOT NULL;

UPDATE webhook_events
SET payload_json = JSON_SET(payload_json, '$.data.license_key', '[redacted]')
WHERE JSON_TYPE(JSON_EXTRACT(payload_json, '$.data.license_key')) = 'STRING';

UPDATE webhook_events
SET payload_json = JSON_SET(payload_json, '$.data.key', '[redacted]')
WHERE JSON_EXTRACT(payload_json, '$.data.key') IS NOT NULL;
