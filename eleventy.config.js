require("dotenv").config();
const Image = require("@11ty/eleventy-img");
const fs = require("fs");

module.exports = function (eleventyConfig) {
  // 🌟 【Cloudflare Pages対策】
  // ビルド前に必ず出力先フォルダを作っておく
  if (!fs.existsSync("./_site/img/")) {
    fs.mkdirSync("./_site/img/", { recursive: true });
  }

  // ==========================================
  // 💡 [共通処理] 外部URLの画像をダウンロードしてWebPに変換する関数
  // ==========================================
  async function processImage(srcUrl) {
    if (!srcUrl) return null;
    return await Image(srcUrl, {
      widths: ["auto"],
      formats: ["webp"],
      outputDir: "./_site/img/",
      urlPath: "/img/",
      cacheOptions: {
        duration: "1d",
        directory: ".cache",
        removeUrlQueryParams: false,
      },
    });
  }

  // ==========================================
  // 💡 本文の中の外部画像をダウンロードして置換する関数
  // ==========================================
  async function downloadAndReplaceImages(htmlContent) {
    if (!htmlContent) return "";

    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    let match;
    const replacements = [];

    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const originalTag = match[0];
      const remoteSrc = match[1];

      if (replacements.some((r) => r.remoteSrc === remoteSrc)) continue;

      try {
        console.log(`📸 画像を発見しました: ${remoteSrc}`);
        let metadata = await processImage(remoteSrc);

        const imageHtml = Image.generateHTML(metadata, {
          alt: "ブログ本文の画像",
          loading: "lazy",
          decoding: "async",
        });

        replacements.push({ originalTag, imageHtml, remoteSrc });
      } catch (error) {
        console.error(
          `❌ 画像のダウンロードに失敗しました (${remoteSrc}):`,
          error,
        );
      }
    }

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
        { headers: { "X-MICROCMS-API-KEY": apiKey } },
      );
      const data = await response.json();

      for (let blog of data.contents) {
        // 1. 本文内の画像をローカル化
        if (blog.content) {
          blog.content = await downloadAndReplaceImages(blog.content);
        }

        // 2. アイキャッチ画像をローカル化
        if (blog.eyecatch && blog.eyecatch.url) {
          try {
            console.log(
              `🖼️ アイキャッチ画像を発見しました: ${blog.eyecatch.url}`,
            );
            let eyecatchMetadata = await processImage(blog.eyecatch.url);
            blog.eyecatch.url = eyecatchMetadata.webp[0].url;
          } catch (error) {
            console.error(
              `❌ アイキャッチ画像のダウンロードに失敗しました (${blog.eyecatch.url}):`,
              error,
            );
          }
        }
      }

      console.log(
        `✅ microCMSから ${data.contents.length} 件の記事を取得し、画像ローカル化を完了しました！`,
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
  eleventyConfig.addPassthroughCopy(".htaccess");

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
