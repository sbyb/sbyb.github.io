// @ts-check
import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

const require = createRequire(import.meta.url);

/**
 * Builds Astro font variants from a Fontsource variable-font package, keeping
 * the full variable axes (e.g. optical size) and only the Latin subsets.
 * @param {string} pkg   e.g. "@fontsource-variable/newsreader"
 * @param {string[]} sheets  e.g. ["opsz.css", "opsz-italic.css"]
 */
function fontsourceVariants(pkg, sheets) {
  const root = dirname(require.resolve(`${pkg}/package.json`));
  const variants = [];
  for (const sheet of sheets) {
    const css = readFileSync(join(root, sheet), "utf8");
    for (const [, body] of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
      const file = body.match(/url\(\.\/files\/([^)]+)\)/)?.[1];
      if (!file || !/-latin-(ext-)?[a-z]+-(normal|italic)\.woff2$/.test(file)) continue;
      const weight = body.match(/font-weight:\s*([^;]+);/)?.[1].trim();
      const style = body.match(/font-style:\s*([^;]+);/)?.[1].trim();
      const range = body.match(/unicode-range:\s*([^;]+);/)?.[1].trim();
      if (!file || !range) continue;
      variants.push({
        src: [`${pkg}/files/${file}`],
        weight,
        style: /** @type {"normal" | "italic"} */ (style),
        unicodeRange: /** @type {[string, ...string[]]} */ (range.split(",").map((r) => r.trim())),
      });
    }
  }
  if (variants.length === 0) throw new Error(`No font variants found in ${pkg}`);
  return /** @type {[any, ...any[]]} */ (variants);
}

/**
 * Self-hosts KaTeX's stylesheet and fonts under /katex/ so math renders
 * without any third-party CDN. Pages only link the stylesheet when they
 * actually contain math.
 * @returns {import("astro").AstroIntegration}
 */
function katexAssets() {
  const dist = join(dirname(require.resolve("katex/package.json")), "dist");
  const files = ["katex.min.css", ...readdirSync(join(dist, "fonts")).filter((f) => f.endsWith(".woff2")).map((f) => `fonts/${f}`)];
  return {
    name: "katex-assets",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const file = req.url?.startsWith("/katex/") && req.url.slice("/katex/".length).split("?")[0];
          if (!file || !files.includes(file)) return next();
          res.setHeader("Content-Type", file.endsWith(".css") ? "text/css" : "font/woff2");
          res.end(readFileSync(join(dist, file)));
        });
      },
      "astro:build:done": ({ dir }) => {
        const out = join(fileURLToPath(dir), "katex");
        mkdirSync(join(out, "fonts"), { recursive: true });
        for (const file of files) copyFileSync(join(dist, file), join(out, file));
      },
    },
  };
}

export default defineConfig({
  site: "https://sbyb.github.io",
  integrations: [sitemap(), katexAssets()],
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Newsreader",
      cssVariable: "--font-serif",
      fallbacks: ["Georgia", "serif"],
      options: {
        variants: fontsourceVariants("@fontsource-variable/newsreader", ["opsz.css", "opsz-italic.css"]),
      },
    },
    {
      provider: fontProviders.local(),
      name: "Inter",
      cssVariable: "--font-sans",
      fallbacks: ["system-ui", "sans-serif"],
      options: {
        variants: fontsourceVariants("@fontsource-variable/inter", ["opsz.css"]),
      },
    },
  ],
});
