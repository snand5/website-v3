module.exports = {
  eleventyComputed: {
    title: (data) => (data.section ? data.section.name : "Blog"),
  },
};
