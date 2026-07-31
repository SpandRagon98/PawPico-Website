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
             VALUES (NULLIF(:customer_id, ""), NULLIF(:email, ""), NULLIF(:full_name, ""),
                     NULLIF(:country, ""), UTC_TIMESTAMP(), UTC_TIMESTAMP())
             ON DUPLICATE KEY UPDATE
               email = COALESCE(VALUES(email), email),
               full_name = COALESCE(VALUES(full_name), full_name),
               country_code = COALESCE(VALUES(country_code), country_code),
               updated_at = UTC_TIMESTAMP()'
        );
        $customer->execute([
            ':customer_id' => $customerId,
            ':email' => $email,
            ':full_name' => $name,
            ':country' => $country,
        ]);
    }

    if ($paymentId !== '') {
        $payment = $db->prepare(
            'INSERT INTO payments
             (dodo_payment_id, dodo_customer_id, customer_email, amount_minor, currency,
              status, event_type, created_at, updated_at)
             VALUES (:payment_id, NULLIF(:customer_id, ""), NULLIF(:email, ""),
                     NULLIF(:amount, ""), NULLIF(:currency, ""), NULLIF(:status, ""),
                     NULLIF(:event_type, ""), UTC_TIMESTAMP(), UTC_TIMESTAMP())
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
            ':customer_id' => $customerId,
            ':email' => $email,
            ':amount' => $amount,
            ':currency' => $currency,
            ':status' => $status,
            ':event_type' => $type,
        ]);
    }

    if (str_starts_with($type, 'entitlement_grant.') || $licenseId !== '' || $licenseKey !== '') {
        $licence = $db->prepare(
            'INSERT INTO licences
             (dodo_licence_id, dodo_payment_id, customer_email, key_last_four,
              status, event_type, created_at, updated_at)
             VALUES (NULLIF(:licence_id, ""), NULLIF(:payment_id, ""), NULLIF(:email, ""),
                     NULLIF(:last_four, ""), NULLIF(:status, ""), NULLIF(:event_type, ""),
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
            ':payment_id' => $paymentId,
            ':email' => $email,
            ':last_four' => $licenseLastFour,
            ':status' => $status,
            ':event_type' => $type,
        ]);
    }

    $db->commit();
    json_response(200, ['ok' => true]);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log('MewMuze Dodo webhook failed: ' . $error->getMessage());
    json_response(500, ['ok' => false, 'error' => 'Webhook storage failed.']);
}
