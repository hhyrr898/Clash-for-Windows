import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const countArg = Number(process.argv.find((arg) => arg.startsWith("--count="))?.split("=")[1] || process.env.ARTICLE_COUNT || 1);
const count = Math.min(9, Math.max(1, Number.isFinite(countArg) ? countArg : 1));
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY");
}

const root = process.cwd();
const blogDir = path.join(root, "src", "blog");
const tagPool = [
  "安装教程",
  "配置导入",
  "连接检查",
  "Windows",
  "macOS",
  "Android",
  "iOS",
  "规则管理",
  "日志查看",
  "版本整理",
  "桌面端",
  "移动端"
];

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/clash\s*for\s*windows/g, "clash-for-windows")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function pickTags(index) {
  const first = tagPool[index % tagPool.length];
  const second = tagPool[(index + 3) % tagPool.length];
  const third = tagPool[(index + 7) % tagPool.length];
  return ["post", first, second, third];
}

function todayWithOffset(index) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + index);
  return date.toISOString().slice(0, 10);
}

async function uniquePath(slug) {
  let finalSlug = slug;
  let attempt = 2;
  while (true) {
    const filePath = path.join(blogDir, `${finalSlug}.md`);
    try {
      await fs.access(filePath);
      finalSlug = `${slug}-${attempt++}`;
    } catch {
      return { finalSlug, filePath };
    }
  }
}

async function createArticle(index) {
  const prompt = `请生成一篇中文资源介绍文章，主题必须围绕 Clash for Windows 长尾标题。返回 JSON，不要代码块。字段：
title: 32字以内，必须包含 Clash for Windows
description: 70字以内
sections: 数组，4个小节，每项包含 heading 和 body，body 约120字
imageQuery: 用于图片检索的中文短语，必须包含 Clash for Windows
要求：内容自然、像正常技术资料站文章；不要出现这些词：seo、关键词、优化、排名、收录、曝光、命令。`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().replace(/^```json\s*|\s*```$/g, "").trim();
  const data = JSON.parse(raw);
  const title = String(data.title || `Clash for Windows 使用资料 ${Date.now()}`);
  const description = String(data.description || "Clash for Windows 使用资料与配置说明。");
  const slug = slugify(title);
  const { finalSlug, filePath } = await uniquePath(slug);
  const date = todayWithOffset(index);
  const tags = pickTags(index);
  const cover = `https://tse-mm.bing.com/th?q=${encodeURIComponent(data.imageQuery || title)}`;

  const body = (data.sections || [])
    .slice(0, 4)
    .map((section) => `## ${section.heading}\n\n${section.body}`)
    .join("\n\n");

  const markdown = `---\nlayout: post.njk\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\ndate: ${date}\ntags: ${JSON.stringify(tags)}\ncover: ${JSON.stringify(cover)}\npermalink: /blog/${finalSlug}/\n---\n\n${body}\n`;

  await fs.writeFile(filePath, markdown, "utf8");
  console.log(`created ${path.relative(root, filePath)}`);
}

await fs.mkdir(blogDir, { recursive: true });

for (let i = 0; i < count; i += 1) {
  await createArticle(i);
}
