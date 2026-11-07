<?php
declare(strict_types=1);

// This interface requires direct MySQL access. Login is disabled.
// Configure MySQL connection in ../config_ryopc/db.php outside webroot

$configPath = dirname(__DIR__) . '/../config_ryopc/db.php';
if (!is_file($configPath)) {
    http_response_code(503);
    exit('service unavailable');
}

require_once $configPath;

try {
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $e) {
    http_response_code(503);
    exit('service unavailable');
}

// No authentication - requires direct DB access to manage
// All operations must go through SQL
header('Content-Type: text/plain; charset=utf-8');
exit("db: connected\nonly sql access allowed\n");
