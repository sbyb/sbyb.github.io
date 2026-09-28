// Small progressive enhancements. The site is fully readable without them.

const root = document.documentElement;

// Light/dark toggle. Follows the OS until the visitor picks one, then remembers it.
document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
  const current = root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
});

// Email addresses are stored reversed in the HTML so simple scrapers can't read them.
for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-email]")) {
  const address = [...(link.dataset.email ?? "")].reverse().join("");
  link.href = `mailto:${address}`;
  if (link.hasAttribute("data-email-text")) link.textContent = address;
}

// Abstract / BibTeX disclosure buttons.
for (const button of document.querySelectorAll<HTMLButtonElement>("button[data-toggle]")) {
  const panel = document.getElementById(button.getAttribute("aria-controls") ?? "");
  if (!panel) continue;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
  });
}

// Copy BibTeX.
for (const button of document.querySelectorAll<HTMLButtonElement>("button[data-copy]")) {
  const label = button.querySelector("[data-copy-label]");
  button.addEventListener("click", async () => {
    const source = document.getElementById(button.dataset.copy ?? "");
    if (!source) return;
    try {
      await navigator.clipboard.writeText(source.textContent?.trim() ?? "");
    } catch {
      return;
    }
    button.dataset.copied = "";
    if (label) label.textContent = "Copied";
    setTimeout(() => {
      delete button.dataset.copied;
      if (label) label.textContent = "Copy";
    }, 1600);
  });
}

// Header: reveal the name once the big one in the hero has scrolled away.
const header = document.querySelector<HTMLElement>("[data-header]");
const heroName = document.querySelector(".hero__name");
if (header && heroName) {
  new IntersectionObserver(([entry]) => header.toggleAttribute("data-scrolled", !entry.isIntersecting), {
    rootMargin: "-64px 0px 0px 0px",
  }).observe(heroName);
}

// Highlight the section currently being read in the header menu.
const navLinks = new Map(
  [...document.querySelectorAll<HTMLAnchorElement>("[data-nav]")].map((a) => [a.dataset.nav ?? "", a]),
);
if (navLinks.size > 0) {
  const ids = [...navLinks.keys()];
  const visible = new Set<string>();
  const update = () => {
    const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    const current = atBottom ? ids[ids.length - 1] : ids.find((id) => visible.has(id));
    for (const [id, link] of navLinks) {
      if (id === current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      update();
    },
    { rootMargin: "-30% 0px -65% 0px" },
  );
  for (const id of ids) {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  }
  addEventListener("scroll", update, { passive: true });
}
