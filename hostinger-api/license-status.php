<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(405, ['ok' => false, 'error' => 'POST required.']);
}

$config = mewmuze_config();
$apiKey = trim((string)($config['dodo_api_key'] ?? ''));
$mode = (string)($config['dodo_mode'] ?? 'test_mode');
if ($apiKey === '') {
    json_response(503, ['ok' => false, 'error' => 'Device status is not configured.']);
}

$body = file_get_contents('php://input');
$payload = json_decode($body === false ? '' : $body, true);
if (!is_array($payload)) {
    json_response(400, ['ok' => false, 'error' => 'Invalid JSON.']);
}
$licenseKey = trim((string)($payload['license_key'] ?? ''));
$licenseKeyId = trim((string)($payload['license_key_id'] ?? ''));
$instanceId = trim((string)($payload['license_key_instance_id'] ?? ''));
if ($licenseKey === '' || strlen($licenseKey) > 400
    || !preg_match('/^[A-Za-z0-9_-]+$/', $licenseKeyId)
    || !preg_match('/^[A-Za-z0-9_-]+$/', $instanceId)) {
    json_response(400, ['ok' => false, 'error' => 'Invalid licence status request.']);
}

$base = $mode === 'live_mode' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';

/** @return array{status:int, body:array<string,mixed>} */
function dodo_json_request(string $method, string $url, array $body = [], string $bearer = ''): array
{
    $curl = curl_init($url);
    if ($curl === false) {
        throw new RuntimeException('Could not initialise the payment client.');
    }
    $headers = ['Accept: application/json'];
    if ($body !== []) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body, JSON_THROW_ON_ERROR));
    }
    if ($bearer !== '') {
        $headers[] = 'Authorization: Bearer ' . $bearer;
    }
    curl_setopt_array($curl, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    $response = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    if (!is_string($response)) {
        curl_close($curl);
        throw new RuntimeException('The payment service is unreachable.');
    }
    curl_close($curl);
    $decoded = json_decode($response, true);
    return ['status' => $status, 'body' => is_array($decoded) ? $decoded : []];
}

try {
    // Possession of an arbitrary license-key ID is not enough. First prove the
    // supplied key and this exact activation instance are valid through Dodo's
    // public validation endpoint; only then use the seller secret server-side.
    $validation = dodo_json_request('POST', $base . '/licenses/validate', [
        'license_key' => $licenseKey,
        'license_key_instance_id' => $instanceId,
    ]);
    if ($validation['status'] >= 300 || ($validation['body']['valid'] ?? false) !== true) {
        json_response(403, ['ok' => false, 'error' => 'Licence validation failed.']);
    }

    $details = dodo_json_request(
        'GET',
        $base . '/license_keys/' . rawurlencode($licenseKeyId),
        [],
        $apiKey,
    );
    if ($details['status'] >= 300) {
        json_response(503, ['ok' => false, 'error' => 'Device status is temporarily unavailable.']);
    }
    $status = strtolower((string)($details['body']['status'] ?? ''));
    if ($status !== 'active') {
        json_response(403, ['ok' => false, 'error' => 'The licence is not active.']);
    }
    json_response(200, [
        'ok' => true,
        'devices_used' => max(0, (int)($details['body']['instances_count'] ?? 0)),
        'device_limit' => max(1, (int)($details['body']['activations_limit'] ?? 3)),
    ]);
} catch (Throwable $error) {
    error_log('MewMuze licence status failed: ' . get_class($error));
    json_response(503, ['ok' => false, 'error' => 'Device status is temporarily unavailable.']);
}
