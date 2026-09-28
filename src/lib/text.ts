import katex from "katex";
import { marked } from "marked";

const MATH = /(?<!\\)\$([^$\n]+?)(?<!\\)\$/g;

/** True if the text contains inline math such as `$\mathsf{AC}^0$`. */
export const hasMath = (text: string | undefined) =>
  !!text && (text.includes("$$") || new RegExp(MATH.source).test(text));

/**
 * Renders a short piece of inline Markdown (links, emphasis, code) with
 * `$...$` math typeset by KaTeX at build time. Returns an HTML string.
 */
export function inline(text: string): string {
  const rendered: string[] = [];
  const withPlaceholders = text.replace(MATH, (_, tex: string) => {
    rendered.push(katex.renderToString(tex, { throwOnError: false }));
    return `KATEXPLACEHOLDER${rendered.length - 1}END`;
  });
  const html = marked.parseInline(withPlaceholders, { async: false, gfm: true });
  return html.replace(/KATEXPLACEHOLDER(\d+)END/g, (_, i: string) => rendered[Number(i)]);
}

/**
 * Renders full Markdown (paragraphs, lists, links, ...) with `$...$` inline
 * math and `$$...$$` display math typeset by KaTeX at build time.
 */
export function block(text: string): string {
  const rendered: string[] = [];
  const stash = (html: string) => `KATEXPLACEHOLDER${rendered.push(html) - 1}END`;
  const withPlaceholders = text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) =>
      stash(katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false })),
    )
    .replace(MATH, (_, tex: string) => stash(katex.renderToString(tex, { throwOnError: false })));
  const html = marked.parse(withPlaceholders, { async: false, gfm: true });
  return html.replace(/KATEXPLACEHOLDER(\d+)END/g, (_, i: string) => rendered[Number(i)]);
}

/** URL-safe id from arbitrary text. */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\$[^$]*\$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
