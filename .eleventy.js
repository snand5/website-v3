const postcss = require("postcss");
const sass = require("sass");
const path = require("path");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItImplicitFigures = require("markdown-it-implicit-figures");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
module.exports = function (eleventyConfig) {
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPassthroughCopy({
    "src/assets/fonts": "assets/fonts",
    "src/assets/js": "assets/js",
    "src/assets/images": "assets/images",
    "src/site.webmanifest": "",
    "node_modules/@fortawesome/fontawesome-free":
      "assets/fonts/fontawesome-free",
  });
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addFilter("sortBlogs", function (posts) {
    function getAuthor(post) {
      if (post.author) {
        const name = post.author.replace(/( Jr\.?| Sr\.?| III?)$/, "");
        const lastName = name.split(" ").pop();
        return lastName.toLowerCase();
      } else if (post.text) {
        // post.text is the blog/feed title, used as sort key when no author is given
        const name = post.text.replace(/^The\s+/i, "");
        return name.toLowerCase();
      }
      return "";
    }
    return posts.sort(function (a, b) {
      const authorA = getAuthor(a);
      const authorB = getAuthor(b);
      return authorA.localeCompare(authorB);
    });
  });
  eleventyConfig.addShortcode("postcss", async function (filename) {
    const filepath = path.join("src/assets/styles", filename);
    const compiled = sass.compile(filepath);
    return await postcss([autoprefixer, cssnano])
      .process(compiled.css, { from: filepath })
      .then(function (result) {
        return result.css;
      });
  });
  eleventyConfig.addFilter("readingTime", function (content) {
    const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text.split(" ").filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  });
  eleventyConfig.addFilter("readableDate", function (date) {
    const d = date instanceof Date ? date : new Date(date);
    const parts = new Intl.DateTimeFormat("en-AU", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    }).formatToParts(d);
    function getPart(type) {
      return parts.find(p => p.type === type).value;
    }
    return `${getPart("day")} ${getPart("month")}, ${getPart("year")}`;
  });
  eleventyConfig.addFilter("limit", function (arr, n) {
    return arr.slice(0, n);
  });
  eleventyConfig.addFilter("skip", function (arr, n) {
    return arr.slice(n);
  });
  eleventyConfig.addCollection("sectionList", function (collection) {
    const slugify = eleventyConfig.getFilter("slugify");
    const posts = collection.getFilteredByTag("posts");
    const map = {};
    posts.forEach(function (post) {
      const section = post.data.section || "Uncategorised";
      (map[section] = map[section] || []).push(post);
    });
    return Object.entries(map).map(function ([name, sectionPosts]) {
      return {
        name,
        slug: slugify(name),
        posts: [...sectionPosts].sort(function (a, b) { return b.date - a.date; }),
      };
    });
  });
  eleventyConfig.setNunjucksEnvironmentOptions({
    trimBlocks: true,
    lstripBlocks: true,
  });
  eleventyConfig.setServerOptions({
    module: "@11ty/eleventy-server-browsersync",
    middleware: function (req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      next();
    },
  });
  const md = markdownIt({ html: true })
    .use(markdownItFootnote)
    .use(markdownItImplicitFigures, { figcaption: true });
  md.renderer.rules.footnote_caption = (tokens, idx) => {
    let n = String(tokens[idx].meta.id + 1);
    if (tokens[idx].meta.subId > 0) n += ':' + tokens[idx].meta.subId;
    return n;
  };
  eleventyConfig.setLibrary("md", md);
  return {
    dir: {
      input: "src",
      output: "dist",
    },
  };
};
