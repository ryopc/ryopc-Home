require("dotenv").config();
const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // ==========================================
  // 💡 本文の中の外部画像をダウンロードして置換する関数（バグ修正版）
  // ==========================================
  async function downloadAndReplaceImages(htmlContent) {
    if (!htmlContent) return "";

    // HTMLの中から <img> タグ全体の文字列と、src（URL）を正確に抜き出す正規表現
    const imgRegex = /(<img[^>]+src=["']([^"']+)["'][^>]*>)/g;
    let match;
    const replacements = [];

    // まずHTML内のすべての画像URLを洗い出す
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const originalTag = match[1]; // 🌟インデックス指定を修正：<img src="..."> 全体
      const remoteSrc = match[2]; // 🌟インデックス指定を修正：画像URL（microcms-assets.ioなど）のみ

      // すでにリストにある場合はスキップ
      if (replacements.some((r) => r.originalTag === originalTag)) continue;

      try {
        console.log(
          `📸 画像を発見しました。ダウンロードを開始します: ${remoteSrc}`,
        );

        // 外部画像をダウンロードして最適化（WebPとJPEGに自動変換）
        let metadata = await Image(remoteSrc, {
          widths: ["auto"], // オリジナルサイズを維持
          formats: ["webp", "jpeg"], // 軽いWebPと標準のJPEGを用意
          outputDir: "./_site/img/", // 成果物フォルダの保存先
          urlPath: "/img/", // ブラウザから見たパス
        });

        // 最適な <picture> や <img> タグのHTML文字列を自動生成
        const imageHtml = Image.generateHTML(metadata, {
          alt: "ブログ本文の画像",
          loading: "lazy", // 遅延読み込みで表示を速くする
          decoding: "async",
        });

        replacements.push({ originalTag, imageHtml });
      } catch (error) {
        console.error(
          `❌ 画像のダウンロードに失敗しました (${remoteSrc}):`,
          error,
        );
      }
    }

    // まとめて安全に置換を実行する
    let updatedHtml = htmlContent;
    for (const item of replacements) {
      updatedHtml = updatedHtml.split(item.originalTag).join(item.imageHtml);
    }

    return updatedHtml;
  }

  // ==========================================
  // microCMSから安全にデータを取得（画像置換つき）
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

      // 各記事の「本文（content）」をループ処理して画像を中に入れます
      for (let blog of data.contents) {
        if (blog.content) {
          blog.content = await downloadAndReplaceImages(blog.content);
        }
      }

      console.log(
        `✅ microCMSから ${data.contents.length} 件の記事を取得し、本文内の画像をすべてローカルに取り込みました！`,
      );
      return data.contents;
    } catch (error) {
      console.error("❌ microCMSからのデータ取得に失敗しました:", error);
      return [];
    }
  });

  // （以下、パススルー設定やdir設定などはそのまま）
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
