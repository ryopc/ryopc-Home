<?php
/**
 * お問い合わせフォーム受信・Turnstile検証・FormSubmit.co転送
 * 
 * 設定ファイル: /home/xs261846/config/turnstile.php (Webルート外)
 *   返り値: ['TURNSTILE_SECRET', 'TURNSTILE_HOSTNAMES', 'FORMSUBMIT_ENDPOINT', 'FORMSUBMIT_REDIRECT']
 */

// 設定読み込み（本番環境: Webルート外の設定ファイルから）
$configPath = '/home/xs261846/config/turnstile.php';
if (!is_file($configPath) || !is_readable($configPath)) {
    error_log('Turnstile config not found: ' . $configPath);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server configuration error']);
    exit;
}
$config = include $configPath;
$turnstileSecret = $config['TURNSTILE_SECRET'] ?? '';
$allowedHostnames = array_map('trim', explode(',', $config['TURNSTILE_HOSTNAMES'] ?? 'ryopc.org'));
$formsubmitEndpoint = $config['FORMSUBMIT_ENDPOINT'] ?? 'https://formsubmit.co/9ed07af3dba9707a82c1878969c186ec';
$formsubmitRedirect = $config['FORMSUBMIT_REDIRECT'] ?? 'https://ryopc.org';

// CORS設定（同一オリジンなら不要だが念のため）
header('Content-Type: application/json; charset=utf-8');

// POSTのみ許可
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// 入力取得
$token = $_POST['cf-turnstile-response'] ?? '';
$clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';

// バリデーション
if (!is_string($token) || $token === '' || strlen($token) > 2048 || empty($allowedHostnames)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

if (empty($turnstileSecret)) {
    error_log('Turnstile secret not configured');
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server configuration error']);
    exit;
}

// Turnstile siteverify 呼び出し
$verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
$postData = http_build_query([
    'secret'   => $turnstileSecret,
    'response' => $token,
    'remoteip' => $clientIp,
]);

$ch = curl_init($verifyUrl);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $postData,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpCode !== 200) {
    error_log("Turnstile siteverify failed: HTTP $httpCode");
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Verification service unavailable']);
    exit;
}

$result = json_decode($response, true);
if (!$result || !isset($result['success'])) {
    error_log('Turnstile siteverify returned invalid JSON');
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Verification failed']);
    exit;
}

// 検証結果チェック
if (
    !$result['success'] ||
    ($result['action'] !== 'contact') ||
    !in_array($result['hostname'] ?? '', $allowedHostnames, true)
) {
    error_log('Turnstile verification failed: ' . json_encode($result));
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Verification failed. Please try again.']);
    exit;
}

// 検証成功 → FormSubmit.co へ転送
$forwardData = $_POST;
unset($forwardData['cf-turnstile-response']); // Turnstileトークンは転送不要
$forwardData['_redirect'] = $formsubmitRedirect;

$forwardCh = curl_init($formsubmitEndpoint);
curl_setopt_array($forwardCh, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query($forwardData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
]);
$forwardResponse = curl_exec($forwardCh);
$forwardHttpCode = curl_getinfo($forwardCh, CURLINFO_HTTP_CODE);
curl_close($forwardCh);

if ($forwardResponse === false || $forwardHttpCode >= 400) {
    error_log("FormSubmit.co forward failed: HTTP $forwardHttpCode");
    http_response_code(502);
    echo json_encode(['success' => false, 'error' => 'Failed to submit form. Please try again later.']);
    exit;
}

// 成功
echo json_encode(['success' => true, 'message' => 'メッセージを送信しました。']);