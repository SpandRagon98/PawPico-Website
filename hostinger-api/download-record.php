<?php
declare(strict_types=1);

require __DIR__ . '/auth-lib.php';

$body = auth_require_post_from_site();

$edition = strtolower(trim((string)($body['edition'] ?? '')));
if (!in_array($edition, ['free', 'pro'], true)) {
    json_response(400, ['ok' => false, 'error' => 'Unknown edition.']);
}

try {
    $db = mewmuze_db(mewmuze_config());
    $user = auth_current_user($db);
    if ($user === null) {
        json_response(401, ['ok' => false, 'error' => 'Sign in to download.']);
    }

    // The Pro build is only for accounts with a paid, unrefunded purchase.
    if ($edition === 'pro' && !auth_has_pro($db, $user['email'])) {
        json_response(403, [
            'ok' => false,
            'error' => 'This account has no MewMuze Pro purchase yet.',
        ]);
    }

    $db->prepare(
        'INSERT INTO download_events (user_id, edition, created_at, ip_hash)
         VALUES (:user_id, :edition, :now, :ip)'
    )->execute([
        ':user_id' => $user['id'],
        ':edition' => $edition,
        ':now' => (new DateTimeImmutable('now'))->format('Y-m-d H:i:s'),
        ':ip' => auth_client_ip_hash(),
    ]);

    json_response(200, ['ok' => true]);
} catch (Throwable $error) {
    error_log('MewMuze download record failed: ' . get_class($error));
    json_response(503, ['ok' => false, 'error' => 'Downloads are temporarily unavailable.']);
}
