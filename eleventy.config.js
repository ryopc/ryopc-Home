require("dotenv").config();
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const fs = require("fs");

module.exports = function (eleventyConfig) {
  
  // 🌟 【Cloudflare Pages対策】
  // ビルド前に必ず出力先フォルダを作っておくことで、キャッシュ使用時も画像が消えなくなります
  if (!fs.existsSync("./_site/img/")) {
    fs.mkdirSync("./_site/img/", { recursive: true });
  }

  // ==========================================
  // 🎇 サイト全体のすべての画像を全自動でローカル化＆WebP変換するプラグイン
  // ==========================================
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // 軽いWebP形式に自動変換
    formats: ["webp"],

    // オリジナルサイズを維持
    widths: ["auto"],

    // 生成された画像の保存先とHTML上のパス
    outputDir: "./_site/img/",
    urlPath: "/img/",

    // サイト内のすべての <img> タグを書き換えの対象にする
    htmlOptions: {
      selector: "img"
    },

    // Cloudflare Pagesで高速ビルドするためのキャッシュ設定
    cacheOptions: {
      duration: "1d",
      directory: ".cache",
      removeUrlQueryParams: false,
    }
  });

  // ==========================================
  // microCMSから安全にデータを取得
  // ==========================================
  eleventyConfig.addGlobalData("blogs", async () => {
    const apiDomain = process.env.MICROCMS_DOMAIN;
    const apiKey = process.env.MICROCMS_API_KEY;

    if (!apiDomain || !apiKey) {
      console.log("⚠️ microCMSの環境変数が見つからないため、データ取得をスキップします。");
      return [];
    }

    try {
      const response = await fetch(
        `https://${apiDomain}.microcms.io/api/v1/blogs`,
        { headers: { "X-MICROCMS-API-KEY": apiKey } }
      );
      const data = await response.json();

      // 💡 [重要] 本文内の画像やアイキャッチの個別処理（downloadAndReplaceImages）は
      // 上記のプラグインがHTML出力時に「全自動」でやってくれるようになったため、
      // ここでの複雑なループ処理や正規表現コードはすべて不要になり、削除しました！
      // これにより、microCMSからは生のデータをそのまま綺麗に受け取るだけでOKになります。

      console.log(`✅ microCMSから ${data.contents.length} 件の記事を取得しました。`);
      return data.contents;
    } catch (error) {
      console.error("❌ microCMSからのデータ取得に失敗しました:", error);
      return [];
    }
  });

  // （パススルー設定はそのまま）
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("fonts");

  return {
    pathPrefix: "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      output: "_site",
    },
  };
};
