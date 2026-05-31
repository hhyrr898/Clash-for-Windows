# Clash for Windows

Eleventy 静态站点，适配 GitHub Pages 与 Cloudflare Pages。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

输出目录为 `_site`。Cloudflare Pages 可设置：

- Build command: `npm run build`
- Output directory: `_site`
- Node.js version: `20`

## 自动文章

GitHub Actions `Daily Gemini Article` 每天生成 1 篇文章，也可手动输入 `1-9` 批量生成。需要配置：

- Repository secret: `GEMINI_API_KEY`
- Repository secret: `BING_INDEXNOW_KEY`
- Repository variable: `SITE_URL`

首次推送全部公开地址时，手动运行工作流并将 `push_all` 设置为 `true`。之后有文章更新时，只提交本次新增文章地址。
