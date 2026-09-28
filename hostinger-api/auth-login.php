<?php
declare(strict_types=1);

require __DIR__ . '/auth-lib.php';

$body = auth_require_post_from_site();

$email = auth_normalise_email($body['email'] ?? '');
$password = (string)($body['password'] ?? '');

// One message for every failure below, so the endpoint never reveals which
// email addresses have accounts.
$refuse = static fn(): never => json_response(401, ['ok' => false, 'error' => 'Email or password is incorrect.']);

if ($email === '' || $password === '' || strlen($password) > AUTH_MAX_PASSWORD) {
    $refuse();
}

try {
    $db = mewmuze_db(mewmuze_config());

    if (!auth_throttle($db, 'login', 20, 900)) {
        json_response(429, ['ok' => false, 'error' => 'Too many attempts. Try again in a few minutes.']);
    }

    $query = $db->prepare(
        'SELECT id, email, full_name, password_hash, failed_attempts, locked_until
         FROM users WHERE email = :email LIMIT 1'
    );
    $query->execute([':email' => $email]);
    $user = $query->fetch();

    $now = new DateTimeImmutable('now');
    if (!is_array($user)) {
        // Spend comparable time on a missing account so the response time does
        // not say whether the email exists.
        password_verify($password, '$2y$12$usesomesillystringfoobarbazquxquuxcorgegraultgarplyw');
        $refuse();
    }

    $lockedUntil = $user['locked_until'] !== null ? new DateTimeImmutable((string)$user['locked_until']) : null;
    if ($lockedUntil !== null && $lockedUntil > $now) {
        json_response(429, ['ok' => false, 'error' => 'Too many attempts. Try again in a few minutes.']);
    }

    if (!password_verify($password, (string)$user['password_hash'])) {
        $attempts = (int)$user['failed_attempts'] + 1;
        $lock = $attempts >= 8 ? $now->modify('+15 minutes')->format('Y-m-d H:i:s') : null;
        $db->prepare('UPDATE users SET failed_attempts = :attempts, locked_until = :lock, updated_at = :now WHERE id = :id')
            ->execute([
                ':attempts' => $attempts,
                ':lock' => $lock,
                ':now' => $now->format('Y-m-d H:i:s'),
                ':id' => $user['id'],
            ]);
        $refuse();
    }

    if (password_needs_rehash((string)$user['password_hash'], PASSWORD_DEFAULT)) {
        $db->prepare('UPDATE users SET password_hash = :hash WHERE id = :id')
            ->execute([':hash' => password_hash($password, PASSWORD_DEFAULT), ':id' => $user['id']]);
    }

    $db->prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = :login_at, updated_at = :updated_at WHERE id = :id')
        ->execute([
            ':login_at' => $now->format('Y-m-d H:i:s'),
            ':updated_at' => $now->format('Y-m-d H:i:s'),
            ':id' => $user['id'],
        ]);

    auth_start_session($db, (int)$user['id']);

    json_response(200, auth_account_payload($db, [
        'id' => (int)$user['id'],
        'email' => (string)$user['email'],
        'name' => (string)($user['full_name'] ?? ''),
    ]));
} catch (Throwable $error) {
    error_log('MewMuze login failed: ' . get_class($error));
    json_response(503, ['ok' => false, 'error' => 'Accounts are temporarily unavailable.']);
}
