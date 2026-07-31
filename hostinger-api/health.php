<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

try {
    $db = mewmuze_db(mewmuze_config());
    $db->query('SELECT 1');
    json_response(200, ['ok' => true, 'service' => 'mewmuze-commerce']);
} catch (Throwable $error) {
    error_log('MewMuze health check failed: ' . $error->getMessage());
    json_response(503, ['ok' => false, 'service' => 'mewmuze-commerce']);
}
