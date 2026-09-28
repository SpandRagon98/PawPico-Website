<?php
declare(strict_types=1);

/**
 * Shared account helpers. Denied to the public by .htaccess, like bootstrap.php.
 *
 * Rules this file exists to keep in one place:
 *  - a password is hashed with password_hash() and never stored, logged or
 *    echoed back in any form;
 *  - the session cookie is random, and only its SHA-256 is written to the
 *    database, so a database leak cannot be replayed as a login;
 *  - the billing tables (payments, licences) are READ ONLY from here. Account
 *    code must never write to them.
 */

require_once __DIR__ . '/bootstrap.php';

const AUTH_COOKIE = 'mewmuze_session';
const AUTH_SESSION_DAYS = 30;
const AUTH_MIN_PASSWORD = 10;
const AUTH_MAX_PASSWORD = 200;

/** Requests must be JSON from our own origin: the session cookie is SameSite=Lax. */
function auth_require_post_from_site(): array
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'POST required.']);
    }

    $origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin !== '') {
        $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
        $originHost = strtolower((string)(parse_url($origin, PHP_URL_HOST) ?? ''));
        if ($originHost === '' || ($originHost !== $host && $originHost !== 'www.' . $host && 'www.' . $originHost !== $host)) {
            json_response(403, ['ok' => false, 'error' => 'Request blocked.']);
        }
    }

    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 8192) {
        json_response(400, ['ok' => false, 'error' => 'Invalid request.']);
    }
    $body = json_decode($raw, true);
    if (!is_array($body)) {
        json_response(400, ['ok' => false, 'error' => 'Invalid request.']);
    }
    return $body;
}

function auth_client_ip_hash(): string
{
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    // Hashed, never stored raw: this is only used for throttling and for a
    // rough "where was this session used" record.
    return hash('sha256', 'mewmuze-ip|' . $ip);
}

/**
 * Fixed-window throttle. Returns false when the caller has spent its budget.
 * Deliberately coarse: it protects against credential stuffing, not against a
 * determined distributed attacker.
 */
function auth_throttle(PDO $db, string $action, int $limit, int $windowSeconds): bool
{
    $bucket = $action . '|' . auth_client_ip_hash();
    $now = new DateTimeImmutable('now');
    $cutoff = $now->modify('-' . $windowSeconds . ' seconds')->format('Y-m-d H:i:s');

    $db->prepare('DELETE FROM auth_throttle WHERE window_start < :cutoff')
        ->execute([':cutoff' => $now->modify('-1 day')->format('Y-m-d H:i:s')]);

    $read = $db->prepare('SELECT attempts, window_start FROM auth_throttle WHERE bucket = :bucket');
    $read->execute([':bucket' => $bucket]);
    $row = $read->fetch();

    if (!is_array($row) || (string)$row['window_start'] < $cutoff) {
        $db->prepare(
            'INSERT INTO auth_throttle (bucket, attempts, window_start)
             VALUES (:bucket, 1, :now)
             ON DUPLICATE KEY UPDATE attempts = 1, window_start = VALUES(window_start)'
        )->execute([':bucket' => $bucket, ':now' => $now->format('Y-m-d H:i:s')]);
        return true;
    }

    if ((int)$row['attempts'] >= $limit) {
        return false;
    }
    $db->prepare('UPDATE auth_throttle SET attempts = attempts + 1 WHERE bucket = :bucket')
        ->execute([':bucket' => $bucket]);
    return true;
}

function auth_normalise_email(mixed $value): string
{
    $email = strtolower(trim((string)$value));
    if ($email === '' || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return '';
    }
    return $email;
}

function auth_set_cookie(string $token, int $expires): void
{
    $secure = ($_SERVER['HTTPS'] ?? '') !== '' && strtolower((string)$_SERVER['HTTPS']) !== 'off';
    setcookie(AUTH_COOKIE, $token, [
        'expires' => $expires,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function auth_start_session(PDO $db, int $userId): void
{
    $token = bin2hex(random_bytes(32));
    $now = new DateTimeImmutable('now');
    $expiresAt = $now->modify('+' . AUTH_SESSION_DAYS . ' days');

    $db->prepare(
        'INSERT INTO user_sessions (user_id, token_hash, created_at, expires_at, last_seen_at, ip_hash, user_agent)
         VALUES (:user_id, :token_hash, :created_at, :expires, :last_seen_at, :ip, :agent)'
    )->execute([
        ':user_id' => $userId,
        ':token_hash' => hash('sha256', $token),
        ':created_at' => $now->format('Y-m-d H:i:s'),
        ':expires' => $expiresAt->format('Y-m-d H:i:s'),
        ':last_seen_at' => $now->format('Y-m-d H:i:s'),
        ':ip' => auth_client_ip_hash(),
        ':agent' => substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
    ]);

    auth_set_cookie($token, $expiresAt->getTimestamp());
}

function auth_end_session(PDO $db): void
{
    $token = (string)($_COOKIE[AUTH_COOKIE] ?? '');
    if ($token !== '') {
        $db->prepare('DELETE FROM user_sessions WHERE token_hash = :token_hash')
            ->execute([':token_hash' => hash('sha256', $token)]);
    }
    auth_set_cookie('', time() - 3600);
}

/** The signed in user, or null. Expired rows are removed as they are met. */
function auth_current_user(PDO $db): ?array
{
    $token = (string)($_COOKIE[AUTH_COOKIE] ?? '');
    if ($token === '' || !preg_match('/^[a-f0-9]{64}$/', $token)) {
        return null;
    }
    $now = (new DateTimeImmutable('now'))->format('Y-m-d H:i:s');

    $query = $db->prepare(
        'SELECT s.id AS session_id, u.id, u.email, u.full_name
         FROM user_sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = :token_hash AND s.expires_at > :now
         LIMIT 1'
    );
    $query->execute([':token_hash' => hash('sha256', $token), ':now' => $now]);
    $row = $query->fetch();
    if (!is_array($row)) {
        return null;
    }

    $db->prepare('UPDATE user_sessions SET last_seen_at = :now WHERE id = :id')
        ->execute([':now' => $now, ':id' => $row['session_id']]);

    return ['id' => (int)$row['id'], 'email' => (string)$row['email'], 'name' => (string)($row['full_name'] ?? '')];
}

/**
 * Does this email own a paid, unrefunded, unrevoked Pro purchase?
 *
 * Mirrors the state machine in purchase-status.php so the site never disagrees
 * with itself about what "paid" means. Strictly a SELECT.
 */
function auth_has_pro(PDO $db, string $email): bool
{
    $query = $db->prepare(
        'SELECT p.status AS payment_status, p.event_type AS payment_event,
                l.status AS licence_status, l.event_type AS licence_event
         FROM payments p
         LEFT JOIN licences l ON l.dodo_payment_id = p.dodo_payment_id
         WHERE p.customer_email = :email
         ORDER BY p.updated_at DESC
         LIMIT 25'
    );
    $query->execute([':email' => $email]);

    foreach ($query->fetchAll() as $row) {
        $paymentStatus = strtolower((string)($row['payment_status'] ?? ''));
        $paymentEvent = strtolower((string)($row['payment_event'] ?? ''));
        $licenceStatus = strtolower((string)($row['licence_status'] ?? ''));
        $licenceEvent = strtolower((string)($row['licence_event'] ?? ''));

        $refunded = str_starts_with($paymentEvent, 'refund.') || str_starts_with($paymentEvent, 'dispute.');
        $revoked = $licenceStatus === 'revoked' || $licenceEvent === 'entitlement_grant.revoked';
        $paid = $paymentEvent === 'payment.succeeded' || in_array($paymentStatus, ['succeeded', 'paid'], true);

        if ($paid && !$refunded && !$revoked) {
            return true;
        }
    }
    return false;
}

/** The shape every account endpoint answers with. */
function auth_account_payload(PDO $db, array $user): array
{
    return [
        'ok' => true,
        'user' => ['email' => $user['email'], 'name' => $user['name']],
        'entitlements' => ['free' => true, 'pro' => auth_has_pro($db, $user['email'])],
    ];
}
