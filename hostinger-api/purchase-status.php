<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    json_response(405, ['ok' => false, 'error' => 'GET required.']);
}

$paymentId = trim((string)($_GET['payment_id'] ?? ''));
if ($paymentId === '' || strlen($paymentId) > 120 || !preg_match('/^[A-Za-z0-9_-]+$/', $paymentId)) {
    json_response(400, ['ok' => false, 'error' => 'Invalid purchase reference.']);
}

try {
    $db = mewmuze_db(mewmuze_config());
    $query = $db->prepare(
        'SELECT p.status AS payment_status, p.event_type AS payment_event,
                l.status AS licence_status, l.event_type AS licence_event
         FROM payments p
         LEFT JOIN licences l ON l.dodo_payment_id = p.dodo_payment_id
         WHERE p.dodo_payment_id = :payment_id
         ORDER BY l.updated_at DESC
         LIMIT 1'
    );
    $query->execute([':payment_id' => $paymentId]);
    $row = $query->fetch();
    if (!is_array($row)) {
        json_response(200, ['ok' => true, 'state' => 'pending', 'fulfilled' => false]);
    }

    $paymentStatus = strtolower((string)($row['payment_status'] ?? ''));
    $paymentEvent = strtolower((string)($row['payment_event'] ?? ''));
    $licenceStatus = strtolower((string)($row['licence_status'] ?? ''));
    $licenceEvent = strtolower((string)($row['licence_event'] ?? ''));
    $refunded = str_starts_with($paymentEvent, 'refund.') || str_starts_with($paymentEvent, 'dispute.');
    $paid = $paymentEvent === 'payment.succeeded' || in_array($paymentStatus, ['succeeded', 'paid'], true);
    $delivered = in_array($licenceStatus, ['delivered', 'active'], true)
        && in_array($licenceEvent, ['entitlement_grant.created', 'entitlement_grant.delivered'], true);
    $revoked = $licenceStatus === 'revoked' || $licenceEvent === 'entitlement_grant.revoked';

    json_response(200, [
        'ok' => true,
        'state' => ($revoked || $refunded) ? 'revoked' : ($paid && $delivered ? 'fulfilled' : ($paid ? 'processing' : 'pending')),
        'fulfilled' => $paid && $delivered && !$revoked && !$refunded,
    ]);
} catch (Throwable $error) {
    error_log('MewMuze purchase status failed: ' . get_class($error));
    json_response(503, ['ok' => false, 'error' => 'Purchase confirmation is temporarily unavailable.']);
}
