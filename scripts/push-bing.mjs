import fs from "node:fs/promises";
import path from "node:path";

const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");
const key = process.env.BING_INDEXNOW_KEY;
const root = process.cwd();
const args = process.argv.slice(2);
const fullSite = args.includes("--all") || process.env.PUSH_ALL === "true";

if (!siteUrl) throw new Error("Missing SITE_URL");
if (!key) throw new Error("Missing BING_INDEXNOW_KEY");

function fileToUrl(file) {
  const normalized = file.replaceAll("\\", "/");
  if (!normalized.startsWith("src/blog/") || !normalized.endsWith(".md")) return null;
  const content = normalized.split("/");
  const filename = content.at(-1).replace(/\.md$/, "");
  return `${siteUrl}/blog/${filename}/`;
}

async function urlsFromSitemap() {
  const sitemapPath = path.join(root, "_site", "sitemap.xml");
  const xml = await fs.readFile(sitemapPath, "utf8");
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

async function urlsFromChangedFiles() {
  const changed = process.env.CHANGED_FILES || "";
  return changed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(fileToUrl)
    .filter(Boolean);
}

const urlList = [...new Set(fullSite ? await urlsFromSitemap() : await urlsFromChangedFiles())];

if (!urlList.length) {
  console.log("no urls to submit");
  process.exit(0);
}

const endpoint = "https://www.bing.com/indexnow";
const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(siteUrl).host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList
  })
});

if (!response.ok) {
  throw new Error(`Bing push failed: ${response.status} ${await response.text()}`);
}

console.log(`submitted ${urlList.length} url(s)`);
