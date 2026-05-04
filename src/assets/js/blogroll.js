(function () {
  const OPML_SUFFIX = ".opml";
  const OPML_NO_SUBSTACK_SUFFIX = "NoSubstack.opml";

  function isSubstackBlog(blog) {
    return blog.dataset.isSubstack === "true";
  }

  function setSubstackVisibility(shouldHide) {
    const blogLists = document.getElementsByClassName("blog-list");
    for (let i = 0; i < blogLists.length; i++) {
      const blogs = blogLists[i].getElementsByTagName("li");
      for (let j = 0; j < blogs.length; j++) {
        if (isSubstackBlog(blogs[j])) {
          blogs[j].classList.toggle("hidden", shouldHide);
        }
      }
    }
  }

  function updateOpmlLinks(shouldHide) {
    const opmlLinks = document.getElementsByClassName("opml-link");
    for (let i = 0; i < opmlLinks.length; i++) {
      if (shouldHide) {
        opmlLinks[i].href = opmlLinks[i].href.replace(
          OPML_SUFFIX,
          OPML_NO_SUBSTACK_SUFFIX
        );
      } else {
        opmlLinks[i].href = opmlLinks[i].href.replace(
          OPML_NO_SUBSTACK_SUFFIX,
          OPML_SUFFIX
        );
      }
    }
  }

  function toggleSubstack() {
    const shouldHide = document.getElementById("toggle-substack").checked;
    setSubstackVisibility(shouldHide);
    updateOpmlLinks(shouldHide);
    const statusEl = document.getElementById("blogroll-status");
    if (statusEl) {
      const total = document.querySelectorAll('.blog-list li').length;
      const hidden = document.querySelectorAll('.blog-list li.hidden').length;
      statusEl.textContent = (total - hidden) + ' blogs shown';
    }
  }

  const substackToggle = document.getElementById("toggle-substack");
  if (!substackToggle) return;
  substackToggle.addEventListener("click", toggleSubstack);
})();
