<?php
// === 【設定してください】 ==========================================
$client_id    = "あなたのクライアントID"; // Flarumで発行されたID
$redirect_uri = "https://あなたのドメイン/api/callback.php"; // このファイルの場所
// ===================================================================

$provider_url = "https://fo.ryopc.org/";
$scope        = "user"; 

// ログインURLの自動生成
$login_url = $provider_url . '?' . http_build_query([
    'client_id'     => $client_id,
    'redirect_uri'  => $redirect_uri,
    'response_type' => 'code',
    'scope'         => $scope,
    'state'         => 'xyz_secure_state_string' // セキュリティ用のランダム文字列
]);
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OAuthログインテスト</title>
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
    <h1>子サービス（テスト環境）</h1>
    <p>下のボタンを押すと、親サイト（Flarum）の認証画面に移動します。</p>
    
    <div style="margin-top: 30px;">
        <a href="<?php echo htmlspecialchars($login_url); ?>" 
           style="padding: 12px 24px; background: #4e73df; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Flarumアカウントでログイン
        </a>
    </div>
</body>
</html>
