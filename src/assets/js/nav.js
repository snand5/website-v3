(function () {
  function setNavAriaState(button, links, isOpen) {
    button.setAttribute("aria-expanded", String(isOpen));
    links.setAttribute("aria-hidden", String(!isOpen));
  }

  function toggleMenu() {
    const isExpanded = this.getAttribute("aria-expanded") === "true";
    const links = document.getElementById("nav-links");
    links.classList.toggle("collapsed");
    setNavAriaState(this, links, !isExpanded);
  }

  const menuButton = document.getElementById("menu-toggle");
  if (!menuButton) return;
  menuButton.addEventListener("click", toggleMenu);
})();
