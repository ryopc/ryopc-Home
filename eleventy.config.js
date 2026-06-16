module.exports = function(eleventyConfig) {
  
  // ==========================================
  // 【新設定】microCMSから安全にデータを取得
  // ==========================================
  eleventyConfig.addGlobalData("blogs", async () => {
    // Cloudflare Pagesの環境変数から安全に読み込む（本物はコードに書かない）
    const apiDomain = process.env.MICROCMS_DOMAIN; 
    const apiKey = process.env.MICROCMS_API_KEY;

    // APIキーやドメインが設定されていない時は処理をスキップ（ローカル開発時のエラー防止）
    if (!apiDomain || !apiKey) {
      console.log("⚠️ microCMSの環境変数が見つからないため、データ取得をスキップします。");
      return [];
    }

    try {
      // 安全にmicroCMSのAPIを叩く
      const response = await fetch(`https://${apiDomain}.microcms.io/api/v1/blogs`, {
        headers: { "X-MICROCMS-API-KEY": apiKey }
      });
      const data = await response.json();
      return data.contents; // 記事データの配列を「blogs」としてEleventyに渡す
    } catch (error) {
      console.error("❌ microCMSからのデータ取得に失敗しました:", error);
      return [];
    }
  });

  // ==========================================
  // 1. 静的ファイルのコピー設定（パススルー）
  // ==========================================
  // ルート直下にあるCNAMEファイルをそのまま出力フォルダにコピー
  eleventyConfig.addPassthroughCopy("CNAME");
  
  // アセット類（ルート直下にある各フォルダをそのままコピー）
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("fonts");

  // ==========================================
  // 2. ディレクトリ・ルートパス設定
  // ==========================================
  return {
    // カスタムドメインのためルートに設定
    pathPrefix: "/", 

    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    dir: {
      input: ".",           // 💡 ルート直下をソースフォルダに指定
      includes: "_includes", // 共通パーツ（ヘッダー等）
      layouts: "_layouts",   // レイアウトテンプレート
      output: "_site"       // Cloudflare Pagesが読み込む公開用フォルダ
    }
  };
};
