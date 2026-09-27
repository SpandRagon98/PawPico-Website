<?php
declare(strict_types=1);

require __DIR__ . '/auth-lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    json_response(405, ['ok' => false, 'error' => 'GET required.']);
}

try {
    $db = mewmuze_db(mewmuze_config());
    $user = auth_current_user($db);

    if ($user === null) {
        json_response(200, ['ok' => true, 'user' => null, 'entitlements' => ['free' => false, 'pro' => false]]);
    }

    json_response(200, auth_account_payload($db, $user));
} catch (Throwable $error) {
    error_log('MewMuze session lookup failed: ' . get_class($error));
    json_response(503, ['ok' => false, 'error' => 'Accounts are temporarily unavailable.']);
}
