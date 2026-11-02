<?php
declare(strict_types=1);

// This interface requires direct MySQL access. Login is disabled.
// Configure MySQL connection in ../config_ryopc/db.php outside webroot

$configPath = getenv('RYOPC_DB_CONFIG');
if ($configPath === false || $configPath === '') {
    $configPath = dirname(__DIR__) . '/../config_ryopc/db.php';
}

if (!is_file($configPath)) {
    http_response_code(503);
    exit('service unavailable');
}

require_once $configPath;

$required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'];
foreach ($required as $const) {
    if (!defined($const)) {
        http_response_code(503);
        exit('service unavailable');
    }
}

try {
    $port = defined('DB_PORT') && DB_PORT !== '' ? ';port=' . DB_PORT : '';
    $socket = defined('DB_SOCKET') && DB_SOCKET !== '' ? ';unix_socket=' . DB_SOCKET : '';
    if ($socket !== '') {
        $dsn = sprintf('mysql:unix_socket=%s;dbname=%s;charset=utf8mb4', DB_SOCKET, DB_NAME);
    } else {
        $dsn = sprintf('mysql:host=%s%s;dbname=%s;charset=utf8mb4', DB_HOST, $port, DB_NAME);
    }
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $e) {
    http_response_code(503);
    exit('service unavailable');
}

header('Content-Type: text/plain; charset=utf-8');
exit("db: connected\nonly sql access allowed\n");
