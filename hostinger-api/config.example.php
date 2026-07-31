<?php
// Example only. The deploy workflow creates .mewmuze-config.php from GitHub
// environment secrets; never commit real credentials.
return [
    'db_host' => 'localhost',
    'db_name' => 'your_database',
    'db_user' => 'your_database_user',
    'db_password' => 'replace-me',
    'dodo_webhook_secret' => 'whsec_replace_me',
];
