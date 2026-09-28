# sbyb.github.io

Personal academic website of Shubham Bhardwaj, served at <https://sbyb.github.io>.

Built with [Astro](https://astro.build) as a fully static site (no JavaScript
framework, just a few lines of script for dark mode and toggles), and deployed
to GitHub Pages by GitHub Actions on every push to `master`.

## Editing content

All content lives in `src/data/`. Sections with no entries are hidden
automatically, so fill in only what you have. Each file has a commented
example at the top.

| What | File |
| --- | --- |
| Name, position, affiliation, advisor, email, CV, interests, profile links | `src/data/profile.yaml` |
| Bio (Markdown) | `src/data/bio.md` |
| News | `src/data/news.yaml` |
| Publications | `src/data/publications.yaml` |
| Teaching | `src/data/teaching.yaml` |
| Talks | `src/data/talks.yaml` |

- **Math:** titles, abstracts, news and the bio support LaTeX math, e.g.
  `$\mathsf{AC}^0[p]$`. It is typeset at build time with KaTeX.
- **Photo:** put a portrait (ideally 4:5 or square, at least 800 px wide) in
  `src/assets/`, e.g. `src/assets/profile.jpg`, and set `photo: profile.jpg`.
  It is resized and converted to modern formats automatically.
- **CV and other files:** anything in `public/` is served as-is. Put your CV at
  `public/cv.pdf` and set `cv: /cv.pdf`; slides can go in `public/slides/`.
- **Publications:** list your name in `authors` exactly as in `profile.yaml`
  (or add other spellings to `author_names`) and it is highlighted
  automatically. Add `abstract` or `bibtex` to get expandable Abstract/BibTeX
  buttons, with a copy button for BibTeX.
- The content is validated when the site builds, so a typo (such as a missing
  `year`) fails the build with a message naming the file and the field
  instead of producing a broken page.

You can edit these files directly on GitHub. The site redeploys a minute or two
after you commit.

## Working locally

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev       # live preview at http://localhost:4321
npm run build     # production build into dist/
npm run check     # type-check the project
```

## Deployment

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub
Pages. One-time setup: in the repository's **Settings → Pages → Build and
deployment**, set **Source** to **GitHub Actions**.

## Design

- Typefaces: [Newsreader](https://fonts.google.com/specimen/Newsreader) (text
  and display, with optical sizing) and [Inter](https://rsms.me/inter/) (labels
  and UI), both self-hosted and preloaded, with metric-matched fallbacks so the
  page doesn't jump while fonts load.
- All colors are CSS variables at the top of `src/styles/global.css`; light and
  dark mode swap them. Dark mode follows the visitor's system setting, with a
  toggle that remembers their choice.
- `public/og.png` is the preview image shown when the site is shared on Slack,
  WhatsApp, LinkedIn, etc.

## Structure

```
src/
  data/          your content (edit these)
  assets/        your photo
  components/    Header, Hero, Section, Publication, Icon, Footer
  layouts/       Base.astro (page shell, meta tags, fonts)
  lib/           content loading/validation, Markdown + math rendering
  pages/         index.astro (home), 404.astro
  scripts/       dark mode, BibTeX/abstract toggles, spam-safe email, menu highlighting
  styles/        global.css
public/          files served as-is (favicon, preview image, CV, ...)
astro.config.mjs site URL, fonts, KaTeX
```
