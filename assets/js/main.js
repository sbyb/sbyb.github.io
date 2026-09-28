(function () {
  "use strict";

  var root = document.documentElement;

  /* Dark mode toggle: remembers the choice, otherwise follows the OS. */
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      if (!current) {
        current = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  }

  /* Email addresses are stored reversed in the HTML to deter scrapers. */
  var unreverse = function (s) {
    return (s || "").split("").reverse().join("");
  };
  document.querySelectorAll("[data-email-u]").forEach(function (el) {
    var address = unreverse(el.getAttribute("data-email-u")) + "@" + unreverse(el.getAttribute("data-email-d"));
    el.setAttribute("href", "mailto:" + address);
    if (el.hasAttribute("data-email-text")) el.textContent = address;
  });

  /* Abstract / BibTeX toggles. */
  document.querySelectorAll("[data-toggle]").forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute("aria-controls"));
    if (!target) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      target.hidden = open;
    });
  });

  /* Copy BibTeX to clipboard. */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.querySelector("span");
    btn.addEventListener("click", function () {
      var source = document.getElementById(btn.getAttribute("data-copy"));
      if (!source || !navigator.clipboard) return;
      navigator.clipboard.writeText(source.textContent.trim()).then(function () {
        btn.classList.add("is-copied");
        if (label) label.textContent = "Copied";
        setTimeout(function () {
          btn.classList.remove("is-copied");
          if (label) label.textContent = "Copy";
        }, 1600);
      });
    });
  });
})();
