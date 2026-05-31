export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });

  const systemTags = new Set(["all", "nav", "post", "posts"]);

  eleventyConfig.addFilter("readableDate", (value) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(value));
  });

  eleventyConfig.addFilter("htmlDate", (value) => {
    return new Date(value).toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("urlEncode", (value) => encodeURIComponent(value));

  eleventyConfig.addFilter("tagSlug", (value) => encodeURIComponent(String(value).trim()));

  eleventyConfig.addFilter("publicTags", (tags = []) => {
    return tags.filter((tag) => !systemTags.has(tag));
  });

  eleventyConfig.addFilter("limit", (items = [], count = 12) => {
    return items.slice(0, count);
  });

  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tags = new Set();
    for (const item of collectionApi.getAll()) {
      for (const tag of item.data.tags || []) {
        if (!systemTags.has(tag)) tags.add(tag);
      }
    }
    return [...tags].sort((a, b) => a.localeCompare(b, "zh-CN"));
  });

  eleventyConfig.addCollection("postsByDate", (collectionApi) => {
    return collectionApi.getFilteredByTag("post").reverse();
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
}
