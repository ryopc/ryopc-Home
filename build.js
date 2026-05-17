const fs = require('fs');
const path = require('path');

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;

const FETCH_OPTIONS = {
  headers: { 'X-MICROCMS-API-KEY': API_KEY }
};

const layout = (title, content) => `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${title} | ryopc org</title>
    <style>
        :root {
            --primary: #0052cc; --dark: #0a192f; --accent: #00bfff; --bg: #f8fafc;
            --text: #334155; --text-light: #94a3b8; --white: #ffffff;
            --glass: rgba(13, 29, 52, 0.9);
            --gradient-accent: linear-gradient(135deg, #00bfff, #0052cc);
            --transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        body { font-family: sans-serif; margin: 0; background: var(--bg); color: var(--text); line-height: 1.6; }
        .navbar { position: fixed; top: 0; width: 100%; background: var(--glass); backdrop-filter: blur(15px); padding: 1rem 2.5rem; z-index: 100; box-sizing: border-box; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .nav-logo { color: var(--white); font-weight: 800; text-decoration: none; }
        header { background: radial-gradient(circle at top right, #172a45, var(--dark)); color: var(--white); padding: 10rem 1.5rem 8rem; text-align: center; }
        header h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin: 0; background: var(--gradient-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .container { max-width: 900px; margin: -4rem auto 6rem; padding: 0 1.5rem; position: relative; }
        .card { background: var(--white); padding: 2.5rem; border-radius: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid rgba(226,232,240,0.8); }
        .tag { display: inline-block; background: #e2e8f0; color: var(--text); padding: 2px 10px; border-radius: 6px; font-size: 0.75rem; margin-right: 5px; font-weight: 600; }
        .category-badge { color: var(--accent); font-weight: 800; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
        .article-content img { max-width: 100%; border-radius: 16px; margin: 1.5rem 0; }
        .custom-image-box { margin: 2rem 0; text-align: center; }
        .custom-image-caption { font-size: 0.85rem; color: var(--text-light); margin-top: 0.5rem; }
    </style>
</head>
<body>
    <nav class="navbar"><a href="/" class="nav-logo">ryopc org</a></nav>
    <header><h1>${title}</h1></header>
    <div class="container">${content}</div>
</body>
</html>
`;

async function build() {
  const distDir = path.join(__dirname, 'dist');
  
  // APIから取得（?depth=1 をつけてカテゴリの中身まで取得）
  const res = await fetch(`https://${SERVICE_DOMAIN}.microcms.io/api/v1/blog?limit=100&depth=1`, FETCH_OPTIONS);
  const { contents: posts } = await res.json();

  // 1. 一覧ページ生成
  const blogDir = path.join(distDir, 'blog');
  fs.mkdirSync(path.join(blogDir, 'articles'), { recursive: true });

  const listHtml = posts.map(post => `
    <a href="/blog/articles/${post.id}/" style="text-decoration:none; color:inherit; display:block; margin-bottom:1.5rem;">
      <div class="card" style="padding:1.5rem; transition:0.3s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='transparent'">
        ${post.category ? `<span class="category-badge">${post.category.name}</span>` : ''}
        <h2 style="margin:0.5rem 0;">${post.title}</h2>
        <div>${(post.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </a>
  `).join('');

  fs.writeFileSync(path.join(blogDir, 'index.html'), layout('Blog List', listHtml));

  // 2. 詳細ページ生成
  posts.forEach(post => {
    // カスタムフィールド「名前付き画像」の処理
    let imageHtml = '';
    if (post.image && post.image.image) {
      imageHtml = `
        <div class="custom-image-box">
          <img src="${post.image.image.url}" alt="${post.image.name || ''}">
          ${post.image.name ? `<div class="custom-image-caption">${post.image.name}</div>` : ''}
        </div>
      `;
    }

    const postHtml = `
      <div class="card">
        ${post.category ? `<span class="category-badge">${post.category.name}</span>` : ''}
        <h1 style="margin-top:0.5rem;">${post.title}</h1>
        <div style="margin-bottom:2rem;">${(post.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
        
        ${imageHtml} <!-- カスタムフィールドの画像 -->
        
        <div class="article-content">${post.body}</div>
        <a href="/blog/" style="display:inline-block; margin-top:2rem; color:var(--primary); font-weight:700; text-decoration:none;">← Back to List</a>
      </div>
    `;

    const postDir = path.join(distDir, 'blog', 'articles', post.id);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, 'index.html'), layout(post.title, postHtml));
  });

  console.log('✅ Build success with Categories and Tags!');
}

build().catch(console.error);
