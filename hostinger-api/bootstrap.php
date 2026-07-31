<?php
declare(strict_types=1);

function json_response(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

function mewmuze_config(): array
{
    $path = __DIR__ . '/.mewmuze-config.php';
    if (!is_file($path)) {
        json_response(503, ['ok' => false, 'error' => 'Payment service is not configured.']);
    }
    $config = require $path;
    if (!is_array($config)) {
        json_response(503, ['ok' => false, 'error' => 'Payment service configuration is invalid.']);
    }
    return $config;
}

function mewmuze_db(array $config): PDO
{
    $host = (string)($config['db_host'] ?? '');
    $name = (string)($config['db_name'] ?? '');
    $user = (string)($config['db_user'] ?? '');
    $password = (string)($config['db_password'] ?? '');
    if ($host === '' || $name === '' || $user === '') {
        json_response(503, ['ok' => false, 'error' => 'Database is not configured.']);
    }
    return new PDO(
        "mysql:host={$host};dbname={$name};charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ],
    );
}

function base64url_decode_strict(string $value): string|false
{
    $value = strtr($value, '-_', '+/');
    $padding = strlen($value) % 4;
    if ($padding !== 0) {
        $value .= str_repeat('=', 4 - $padding);
    }
    return base64_decode($value, true);
}

function verify_dodo_webhook(string $body, array $config): string
{
    $webhookId = trim((string)($_SERVER['HTTP_WEBHOOK_ID'] ?? ''));
    $timestamp = trim((string)($_SERVER['HTTP_WEBHOOK_TIMESTAMP'] ?? ''));
    $signatureHeader = trim((string)($_SERVER['HTTP_WEBHOOK_SIGNATURE'] ?? ''));
    $secret = trim((string)($config['dodo_webhook_secret'] ?? ''));

    if ($webhookId === '' || $timestamp === '' || $signatureHeader === '' || $secret === '') {
        json_response(401, ['ok' => false, 'error' => 'Missing webhook signature.']);
    }
    if (!ctype_digit($timestamp) || abs(time() - (int)$timestamp) > 300) {
        json_response(401, ['ok' => false, 'error' => 'Expired webhook timestamp.']);
    }

    $key = $secret;
    if (str_starts_with($secret, 'whsec_')) {
        $decoded = base64url_decode_strict(substr($secret, 6));
        if ($decoded !== false) {
            $key = $decoded;
        }
    }
    $expected = base64_encode(hash_hmac(
        'sha256',
        $webhookId . '.' . $timestamp . '.' . $body,
        $key,
        true,
    ));

    $valid = false;
    foreach (preg_split('/\s+/', $signatureHeader) ?: [] as $candidate) {
        $parts = explode(',', $candidate, 2);
        $signature = count($parts) === 2 ? $parts[1] : $parts[0];
        if (hash_equals($expected, trim($signature))) {
            $valid = true;
            break;
        }
    }
    if (!$valid) {
        json_response(401, ['ok' => false, 'error' => 'Invalid webhook signature.']);
    }
    return $webhookId;
}

function array_path(array $value, array $path): mixed
{
    $current = $value;
    foreach ($path as $key) {
        if (!is_array($current) || !array_key_exists($key, $current)) {
            return null;
        }
        $current = $current[$key];
    }
    return $current;
}

function first_text(array $payload, array $paths): string
{
    foreach ($paths as $path) {
        $value = array_path($payload, $path);
        if (is_scalar($value) && trim((string)$value) !== '') {
            return trim((string)$value);
        }
    }
    return '';
}
