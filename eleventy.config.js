require('dotenv').config();
module.exports = function(eleventyConfig) {
  

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
      const response = await fetch(`https://${apiDomain}.microcms.io/api/v1/blogs`, {
        headers: { "X-MICROCMS-API-KEY": apiKey }
      });
      const data = await response.json();
      console.log(`✅ microCMSから ${data.contents.length} 件の記事を取得しました！`);
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
      output: "_site"
    }
  };
};