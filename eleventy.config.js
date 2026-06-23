require("dotenv").config();
const Image = require("@11ty/eleventy-img");
const fs = require("fs");

module.exports = function (eleventyConfig) {
  
  // 🌟 【Cloudflare Pages対策】
  // ビルド前に必ず出力先フォルダを作っておくことで、キャッシュ使用時も画像が消えなくなります
  if (!fs.existsSync("./_site/img/")) {
    fs.mkdirSync("./_site/img/", { recursive: true });
  }

  // ==========================================
  // 💡 [共通処理] 外部URLの画像をダウンロードして共通設定でWebPに変換する関数
  // ==========================================
  async function processImage(srcUrl) {
    return await Image(srcUrl, {
      widths: ["auto"], // オリジナルサイズを維持
      formats: ["webp"], // メモリ節約のためwebp単体に統一
      outputDir: "./_site/img/", 
      urlPath: "/img/", 
      cacheOptions: {
        duration: "1d", // キャッシュの有効期限（1日）
        directory: ".cache", // Cloudflare Pagesで引き継ぐキャッシュフォルダ
        removeUrlQueryParams: false, // microCMSのURLパラメータを維持
      },
    });
  }

  // ==========================================
  // 💡 本文の中の外部画像をダウンロードして置換する関数
  // ==========================================
  async function downloadAndReplaceImages(htmlContent) {
    if (!htmlContent) return "";

    // <img> タグの src の中身を正確に抜き出す正規表現
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    let match;
    const replacements = [];

    // まずHTML内のすべての画像URLを洗い出す
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const originalTag = match[0]; // <img src="..."> タグ全体
      const remoteSrc = match[1];   // 画像のURL

      // 画像URLそのもので重複チェック。これで2枚目以降の別画像もスキップされません
      if (replacements.some((r) => r.remoteSrc === remoteSrc)) continue;

      try {
        console.log(`📸 本文画像を発見しました: ${remoteSrc}`);

        // 共通の画像処理関数を呼び出す
        let metadata = await processImage(remoteSrc);

        // <img> タグのHTMLを新しく生成
        const imageHtml = Image.generateHTML(metadata, {
          alt: "ブログ本文の画像",
          loading: "lazy", // 遅延読み込み
          decoding: "async",
        });

        // 重複判定のために remoteSrc も一緒に記録
        replacements.push({ originalTag, imageHtml, remoteSrc });
      } catch (error) {
        console.error(`❌ 本文画像のダウンロードに失敗しました (${remoteSrc}):`, error);
      }
    }

    // 元のHTMLにある <img> タグを、新しく作ったローカル用の <img> タグへ順番に置き換える
    let updatedHtml = htmlContent;
    for (const item of replacements) {
      updatedHtml = updatedHtml.split(item.originalTag).join(item.imageHtml);
    }

    return updatedHtml;
  }

  // ==========================================
  // microCMSから安全にデータを取得（画像＆アイキャッチ置換つき）
  // ==========================================
  eleventyConfig.addGlobalData("blogs", async () => {
    const apiDomain = process.env.MICROCMS_DOMAIN;
    const apiKey = process.env.MICROCMS_API_KEY;

    if (!apiDomain || !apiKey) {
      console.log(
        "⚠️ microCMSの環境変数が見つからないため、データ取得をスキップします。",
      );
      return [];
    }

    try {
      const response = await fetch(
        `https://${apiDomain}.microcms.io/api/v1/blogs`,
        {
          headers: { "X-MICROCMS-API-KEY": apiKey },
        },
      );
      const data = await response.json();

      // 各記事の「本文」と「アイキャッチ」をループ処理してローカル化
      for (let blog of data.contents) {
        // 1. 本文内の画像をローカル化
        if (blog.content) {
          blog.content = await downloadAndReplaceImages(blog.content);
        }

        // 2. 🌟 アイキャッチ画像をローカル化
        if (blog.eyecatch && blog.eyecatch.url) {
          try {
            console.log(`🖼️ アイキャッチ画像を発見しました: ${blog.eyecatch.url}`);
            
            // 共通の画像処理関数でダウンロード＆変換
            let eyecatchMetadata = await processImage(blog.eyecatch.url);
            
            // 変換後のWebP画像のURL（例: "/img/xxxxxx.webp"）を上書きする
            blog.eyecatch.url = eyecatchMetadata.webp[0].url;
            
            console.log(`➡️ アイキャッチをローカルに変換しました: ${blog.eyecatch.url}`);
          } catch (error) {
            console.error(`❌ アイキャッチ画像のダウンロードに失敗しました (${blog.eyecatch.url}):`, error);
          }
        }
      }

      console.log(
        `✅ microCMSから ${data.contents.length} 件の記事を取得し、本文内の画像とアイキャッチをすべてローカルに取り込みました！`,
      );
      return data.contents;
    } catch (error) {
      console.error("❌ microCMSからのデータ取得に失敗しました:", error);
      return [];
    }
  });

  // （パススルー設定）
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
