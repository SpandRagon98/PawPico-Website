<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(405, ['ok' => false, 'error' => 'POST required.']);
}

$config = mewmuze_config();
$body = file_get_contents('php://input');
if ($body === false || $body === '') {
    json_response(400, ['ok' => false, 'error' => 'Empty request.']);
}
$webhookId = verify_dodo_webhook($body, $config);
$payload = json_decode($body, true);
if (!is_array($payload)) {
    json_response(400, ['ok' => false, 'error' => 'Invalid JSON.']);
}

$type = first_text($payload, [['type']]);
$data = is_array($payload['data'] ?? null) ? $payload['data'] : [];
$paymentId = first_text($data, [['payment_id'], ['id']]);
$customerId = first_text($data, [['customer', 'customer_id'], ['customer', 'id'], ['customer_id']]);
$email = first_text($data, [['customer', 'email'], ['email']]);
$name = first_text($data, [['customer', 'name'], ['name']]);
$country = first_text($data, [['billing', 'country'], ['customer', 'country'], ['country']]);
$currency = strtoupper(first_text($data, [['currency']]));
$amount = first_text($data, [['total_amount'], ['amount']]);
$status = first_text($data, [['status']]);
$licenseId = first_text($data, [['license_key_id'], ['entitlement_id'], ['id']]);
$licenseKey = first_text($data, [['license_key'], ['key']]);
$licenseLastFour = $licenseKey === '' ? '' : substr($licenseKey, -4);
$nullable = static fn(string $value): ?string => $value === '' ? null : $value;

try {
    $db = mewmuze_db($config);
    $db->beginTransaction();

    $event = $db->prepare(
        'INSERT IGNORE INTO webhook_events
         (webhook_id, event_type, payload_json, received_at)
         VALUES (:webhook_id, :event_type, :payload_json, UTC_TIMESTAMP())'
    );
    $event->execute([
        ':webhook_id' => $webhookId,
        ':event_type' => $type,
        ':payload_json' => $body,
    ]);
    if ($event->rowCount() === 0) {
        $db->rollBack();
        json_response(200, ['ok' => true, 'duplicate' => true]);
    }

    if ($customerId !== '' || $email !== '') {
        $customer = $db->prepare(
            'INSERT INTO customers
             (dodo_customer_id, email, full_name, country_code, created_at, updated_at)
             VALUES (:customer_id, :email, :full_name, :country,
                     UTC_TIMESTAMP(), UTC_TIMESTAMP())
             ON DUPLICATE KEY UPDATE
               email = COALESCE(VALUES(email), email),
               full_name = COALESCE(VALUES(full_name), full_name),
               country_code = COALESCE(VALUES(country_code), country_code),
               updated_at = UTC_TIMESTAMP()'
        );
        $customer->execute([
            ':customer_id' => $nullable($customerId),
            ':email' => $nullable($email),
            ':full_name' => $nullable($name),
            ':country' => $nullable($country),
        ]);
    }

    if ($paymentId !== '') {
        $payment = $db->prepare(
            'INSERT INTO payments
             (dodo_payment_id, dodo_customer_id, customer_email, amount_minor, currency,
              status, event_type, created_at, updated_at)
             VALUES (:payment_id, :customer_id, :email, :amount, :currency, :status,
                     :event_type, UTC_TIMESTAMP(), UTC_TIMESTAMP())
             ON DUPLICATE KEY UPDATE
               dodo_customer_id = COALESCE(VALUES(dodo_customer_id), dodo_customer_id),
               customer_email = COALESCE(VALUES(customer_email), customer_email),
               amount_minor = COALESCE(VALUES(amount_minor), amount_minor),
               currency = COALESCE(VALUES(currency), currency),
               status = COALESCE(VALUES(status), status),
               event_type = COALESCE(VALUES(event_type), event_type),
               updated_at = UTC_TIMESTAMP()'
        );
        $payment->execute([
            ':payment_id' => $paymentId,
            ':customer_id' => $nullable($customerId),
            ':email' => $nullable($email),
            ':amount' => $nullable($amount),
            ':currency' => $nullable($currency),
            ':status' => $nullable($status),
            ':event_type' => $nullable($type),
        ]);
    }

    if (str_starts_with($type, 'entitlement_grant.') || $licenseId !== '' || $licenseKey !== '') {
        $licence = $db->prepare(
            'INSERT INTO licences
             (dodo_licence_id, dodo_payment_id, customer_email, key_last_four,
              status, event_type, created_at, updated_at)
             VALUES (:licence_id, :payment_id, :email, :last_four, :status, :event_type,
                     UTC_TIMESTAMP(), UTC_TIMESTAMP())
             ON DUPLICATE KEY UPDATE
               dodo_payment_id = COALESCE(VALUES(dodo_payment_id), dodo_payment_id),
               customer_email = COALESCE(VALUES(customer_email), customer_email),
               key_last_four = COALESCE(VALUES(key_last_four), key_last_four),
               status = COALESCE(VALUES(status), status),
               event_type = COALESCE(VALUES(event_type), event_type),
               updated_at = UTC_TIMESTAMP()'
        );
        $licence->execute([
            ':licence_id' => $licenseId !== '' ? $licenseId : $webhookId,
            ':payment_id' => $nullable($paymentId),
            ':email' => $nullable($email),
            ':last_four' => $nullable($licenseLastFour),
            ':status' => $nullable($status),
            ':event_type' => $nullable($type),
        ]);
    }

    $db->commit();
    json_response(200, ['ok' => true]);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    if (isset($db) && $db instanceof PDO) {
        try {
            $diagnostic = $db->prepare(
                'INSERT INTO webhook_events
                 (webhook_id, event_type, payload_json, received_at)
                 VALUES (:webhook_id, :event_type, :payload_json, UTC_TIMESTAMP())
                 ON DUPLICATE KEY UPDATE
                   payload_json = VALUES(payload_json),
                   received_at = UTC_TIMESTAMP()'
            );
            $diagnostic->execute([
                ':webhook_id' => 'error:' . substr(hash('sha256', $webhookId), 0, 48),
                ':event_type' => 'internal.webhook_error',
                ':payload_json' => json_encode(
                    ['exception' => get_class($error), 'message' => $error->getMessage()],
                    JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
                ),
            ]);
        } catch (Throwable) {
            // The normal PHP error log remains the fallback if database diagnostics fail.
        }
    }
    error_log('MewMuze Dodo webhook failed: ' . $error->getMessage());
    json_response(500, ['ok' => false, 'error' => 'Webhook storage failed.']);
}
