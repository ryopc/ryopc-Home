<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$category = $_POST['category'] ?? '4';
$message = $_POST['message'] ?? '';

if (empty($name) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '名前とメッセージは必須です']);
    exit;
}

$timestamp = date('Y-m-d H:i:s');
$log_entry = sprintf(
    "[%s] Category: %s | Name: %s | Email: %s | Message: %s\n",
    $timestamp, $category, $name, $email, $message
);

$log_file = getenv('HOME') . '/ryopc_inquiries.log';
if (file_put_contents($log_file, $log_entry, FILE_APPEND) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'ファイル書き込みエラー']);
    exit;
}

$to = 'ryotagtagtag@gmail.com';
$subject = "新規お問い合わせ: $name";
$mail_body = "名前: $name\nメール: $email\n内容:\n$message";
@mail($to, $subject, $mail_body);

http_response_code(200);
echo json_encode(['success' => true, 'message' => '送信完了！']);
exit;
?>
