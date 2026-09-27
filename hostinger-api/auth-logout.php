<?php
declare(strict_types=1);

require __DIR__ . '/auth-lib.php';

auth_require_post_from_site();

try {
    $db = mewmuze_db(mewmuze_config());
    auth_end_session($db);
    json_response(200, ['ok' => true, 'user' => null, 'entitlements' => ['free' => false, 'pro' => false]]);
} catch (Throwable $error) {
    error_log('MewMuze logout failed: ' . get_class($error));
    // The cookie is cleared either way, so the browser is signed out.
    auth_set_cookie('', time() - 3600);
    json_response(200, ['ok' => true, 'user' => null, 'entitlements' => ['free' => false, 'pro' => false]]);
}
