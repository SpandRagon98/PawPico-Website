<?php
declare(strict_types=1);

require __DIR__ . '/auth-lib.php';

$body = auth_require_post_from_site();

$email = auth_normalise_email($body['email'] ?? '');
$password = (string)($body['password'] ?? '');
$name = trim((string)($body['name'] ?? ''));

if ($email === '') {
    json_response(400, ['ok' => false, 'error' => 'Enter a valid email address.']);
}
if (strlen($password) < AUTH_MIN_PASSWORD || strlen($password) > AUTH_MAX_PASSWORD) {
    json_response(400, ['ok' => false, 'error' => 'Use a password of at least ' . AUTH_MIN_PASSWORD . ' characters.']);
}
if (strlen($name) > 180) {
    $name = substr($name, 0, 180);
}

try {
    $db = mewmuze_db(mewmuze_config());

    if (!auth_throttle($db, 'signup', 10, 3600)) {
        json_response(429, ['ok' => false, 'error' => 'Too many attempts. Try again later.']);
    }

    $now = (new DateTimeImmutable('now'))->format('Y-m-d H:i:s');
    $insert = $db->prepare(
        'INSERT INTO users (email, password_hash, full_name, created_at, updated_at)
         VALUES (:email, :hash, :name, :now, :now)'
    );

    try {
        $insert->execute([
            ':email' => $email,
            ':hash' => password_hash($password, PASSWORD_DEFAULT),
            ':name' => $name !== '' ? $name : null,
            ':now' => $now,
        ]);
    } catch (PDOException $error) {
        // 23000 is the duplicate key on the unique email column.
        if ($error->getCode() === '23000') {
            json_response(409, ['ok' => false, 'error' => 'That email already has an account. Log in instead.']);
        }
        throw $error;
    }

    $userId = (int)$db->lastInsertId();
    auth_start_session($db, $userId);

    json_response(201, auth_account_payload($db, ['id' => $userId, 'email' => $email, 'name' => $name]));
} catch (Throwable $error) {
    // Never log the request body: it holds the password.
    error_log('MewMuze signup failed: ' . get_class($error));
    json_response(503, ['ok' => false, 'error' => 'Accounts are temporarily unavailable.']);
}
