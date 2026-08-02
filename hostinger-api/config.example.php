<?php
// Example only. The deploy workflow creates .mewmuze-config.php from GitHub
// environment secrets; never commit real credentials.
return [
    'db_host' => 'localhost',
    'db_name' => 'your_database',
    'db_user' => 'your_database_user',
    'db_password' => 'replace-me',
    'dodo_webhook_secret' => 'whsec_replace_me',
    // Server-only seller key used for device-count lookup. Never expose this
    // through NEXT_PUBLIC_* variables or ship it in the desktop application.
    'dodo_api_key' => 'dodo_live_replace_me',
    'dodo_mode' => 'test_mode',
];
