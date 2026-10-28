<?php
declare(strict_types=1);

/*
 * send_mail.php
 * 外部システムからの JSON POST を受け取り、レンタルサーバーのメール機能で送信する中継API
 * 送信元（from / from_name）は JSON で指定可能（許可ドメインのみ）
 */

// ==================== 設定ファイルの場所（絶対パスで指定） ====================
define('CONFIG_PATH', '/home/xs261846/config/send_mail_config.php');
// =========================================================================

mb_language('uni');
mb_internal_encoding('UTF-8');

/**
 * 設定値を取得する（設定ファイルは初回のみ読み込む）
 */
function config(string $key): mixed
{
    static $cfg = null;

    if ($cfg === null) {
        if (!is_readable(CONFIG_PATH)) {
            error_log('[send_mail] config file is not readable: ' . CONFIG_PATH);
            fail(500, 'Server configuration error');
        }
        $loaded = require CONFIG_PATH;
        if (!is_array($loaded)) {
            error_log('[send_mail] config file must return an array');
            fail(500, 'Server configuration error');
        }
        $cfg = $loaded;
    }

    if (!array_key_exists($key, $cfg)) {
        error_log('[send_mail] missing config key: ' . $key);
        fail(500, 'Server configuration error');
    }
    return $cfg[$key];
}

/**
 * JSONレスポンスを返して終了する
 */
function respond(int $code, string $status, string $message, array $extra = []): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store');
    echo json_encode(
        array_merge(['status' => $status, 'message' => $message], $extra),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

function fail(int $code, string $message): void
{
    respond($code, 'error', $message);
}

/**
 * Authorization ヘッダーを取得する（Apache/CGI 環境でも取得できるように複数の経路を確認）
 */
function getAuthorizationHeader(): string
{
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (function_exists('apache_request_headers')) {
        foreach (apache_request_headers() as $key => $value) {
            if (strcasecmp($key, 'Authorization') === 0) {
                return $value;
            }
        }
    }
    return '';
}

/**
 * 必須の文字列フィールドを取得・検証する
 */
function requireString(array $data, string $key, int $maxChars): string
{
    if (!isset($data[$key]) || !is_string($data[$key])) {
        fail(400, "'{$key}' は文字列で指定してください");
    }
    $value = trim(str_replace("\0", '', $data[$key]));
    if ($value === '') {
        fail(400, "'{$key}' が空です");
    }
    if (mb_strlen($value, 'UTF-8') > $maxChars) {
        fail(400, "'{$key}' が長すぎます（上限 {$maxChars} 文字）");
    }
    return $value;
}

/**
 * 送信元アドレス（from）を検証する
 * 許可ドメイン以外は拒否し、なりすましメールの踏み台になることを防ぐ
 */
function validateFromAddress(mixed $value): string
{
    if (!is_string($value)) {
        fail(400, "'from' は文字列で指定してください");
    }
    $from = trim(str_replace("\0", '', $value));
    if ($from === '' || strlen($from) > 254 || preg_match('/[\r\n]/', $from)) {
        fail(400, "'from' の形式が不正です");
    }
    if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
        fail(400, "'from' の形式が不正です");
    }

    $domain = strtolower(substr(strrchr($from, '@'), 1));
    $allowedDomains = array_map(
        'strtolower',
        (array) config('allowed_from_domains')
    );
    if (!in_array($domain, $allowedDomains, true)) {
        fail(400, "'from' は許可されたドメインのみ指定できます");
    }
    return $from;
}

/**
 * 送信元の表示名（from_name）を検証する
 */
function validateFromName(mixed $value): string
{
    if (!is_string($value)) {
        fail(400, "'from_name' は文字列で指定してください");
    }
    $name = trim(str_replace("\0", '', $value));
    if ($name === '') {
        fail(400, "'from_name' が空です");
    }
    if (preg_match('/[\r\n]/', $name)) {
        fail(400, "'from_name' に不正な改行が含まれています");
    }
    $maxChars = (int) config('max_from_name_chars');
    if (mb_strlen($name, 'UTF-8') > $maxChars) {
        fail(400, "'from_name' が長すぎます（上限 {$maxChars} 文字）");
    }
    return $name;
}

// ---------------------------------------------------------------------
// 1. メソッドチェック（POST 以外は 405）
// ---------------------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    fail(405, 'Method Not Allowed');
}

// ---------------------------------------------------------------------
// 2. 認証（Authorization: Bearer <api_key> が一致する場合のみ処理を続行）
// ---------------------------------------------------------------------
$apiKey = (string) config('api_key');
if ($apiKey === 'CHANGE_ME_TO_A_LONG_RANDOM_STRING' || strlen($apiKey) < 16) {
    error_log('[send_mail] api_key is not configured');
    fail(500, 'Server configuration error');
}

if (!preg_match('/^Bearer\s+(\S+)$/', getAuthorizationHeader(), $matches)
    || !hash_equals($apiKey, $matches[1])) {
    header('WWW-Authenticate: Bearer');
    fail(401, 'Unauthorized');
}

// ---------------------------------------------------------------------
// 3. Content-Type チェック
// ---------------------------------------------------------------------
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') === false) {
    fail(400, 'Content-Type は application/json を指定してください');
}

// ---------------------------------------------------------------------
// 4. ボディの読み取りと JSON パース
// ---------------------------------------------------------------------
$maxBodyBytes = (int) config('max_body_bytes');
$raw = file_get_contents('php://input', false, null, 0, $maxBodyBytes + 1);
if ($raw === false || $raw === '') {
    fail(400, 'リクエストボディが空です');
}
if (strlen($raw) > $maxBodyBytes) {
    fail(400, 'リクエストボディが大きすぎます');
}

try {
    $data = json_decode($raw, true, 4, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    fail(400, 'JSON の形式が不正です');
}
if (!is_array($data)) {
    fail(400, 'JSON オブジェクトを送信してください');
}

// ---------------------------------------------------------------------
// 5. 入力値の検証
// ---------------------------------------------------------------------
$to = requireString($data, 'to', 254);
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    fail(400, '宛先メールアドレスが不正です');
}

$subject = requireString($data, 'subject', (int) config('max_subject_chars'));
$body    = requireString($data, 'body', (int) config('max_mail_body_chars'));

// 本文形式（省略時は text）
$allowedFormats = (array) config('allowed_formats');
$format = 'text';
if (array_key_exists('format', $data)) {
    if (!is_string($data['format']) || !in_array($data['format'], $allowedFormats, true)) {
        fail(400, "'format' は 'text' または 'html' を指定してください");
    }
    $format = $data['format'];
}

// 送信元（省略時は設定ファイルの既定値）
$mailFrom     = (string) config('mail_from');
$mailFromName = (string) config('mail_from_name');

if (array_key_exists('from', $data)) {
    $mailFrom = validateFromAddress($data['from']);
}
if (array_key_exists('from_name', $data)) {
    $mailFromName = validateFromName($data['from_name']);
}

// ヘッダインジェクション対策（改行コードの混入を拒否）
if (preg_match('/[\r\n]/', $to . $subject)) {
    fail(400, '宛先または件名に不正な改行が含まれています');
}

// ---------------------------------------------------------------------
// 6. メール送信（UTF-8 / base64 で文字化けを防止）
// ---------------------------------------------------------------------
$encodedFromName = mb_encode_mimeheader($mailFromName, 'UTF-8', 'B');
$encodedSubject  = mb_encode_mimeheader($subject, 'UTF-8', 'B');
$mimeType        = ($format === 'html') ? 'text/html' : 'text/plain';

$headers = implode("\r\n", [
    'From: ' . $encodedFromName . ' <' . $mailFrom . '>',
    'Reply-To: ' . $mailFrom,
    'MIME-Version: 1.0',
    'Content-Type: ' . $mimeType . '; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    'X-Mailer: send_mail_api',
]);

$encodedBody = chunk_split(base64_encode($body));

$sent = mail($to, $encodedSubject, $encodedBody, $headers);