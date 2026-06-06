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

GitHub Actions `Daily Gemini Article` 每天生成 1 篇文章，也可手动选择 1-9 篇批量生成。

## GitHub 配置

在仓库 Settings → Secrets and variables → Actions 中设置：

| 类型 | 名称 | 值 |
|------|------|-----|
| Secret | `GEMINI_API_KEY` | Gemini API 密钥 |
| Secret | `BING_API_KEY` | 必应站长工具 API Key |
| Variable | `SITE_URL` | `https://clash-cn.com` |

## 必应 URL 提交

```bash
set SITE_URL=https://clash-cn.com
set BING_API_KEY=your_bing_key
npm run build
npm run push:bing:all
npm run push:bing:updated
```

首次全站推送：手动运行工作流，`push_all` 选 `true`。之后保持 `false`，只提交新文章。
