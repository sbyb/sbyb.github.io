# sbyb.github.io

Personal academic website of Shubham Bhardwaj, served by GitHub Pages at
<https://sbyb.github.io>.

The site is a small custom Jekyll theme with no external theme or build step.
GitHub Pages builds it automatically on every push to the default branch.

## Editing content

Almost everything lives in plain text files. Sections with no entries are
hidden automatically, so you only fill in what you have.

| What | Where |
| --- | --- |
| Name, affiliation, advisor, email, photo, CV, research interests, profile links | `_data/profile.yml` |
| Bio paragraphs (Markdown) | `index.md` |
| News | `_data/news.yml` |
| Publications | `_data/publications.yml` |
| Teaching | `_data/teaching.yml` |
| Talks | `_data/talks.yml` |
| Top menu | `_data/navigation.yml` |
| Site title / description for search engines | `_config.yml` |

Each data file has a commented example at the top showing every supported field.

**Photo:** add a square headshot (at least 400×400 px) as `assets/img/profile.jpg`
and set `photo: /assets/img/profile.jpg` in `_data/profile.yml`. Until then a
monogram with your initials is shown.

**CV:** add `assets/files/cv.pdf` and set `cv: /assets/files/cv.pdf`. A "CV" link
then appears in the menu and next to your profile links.

**Publications:** list your name in `authors` exactly as it appears in
`_data/profile.yml` and it is highlighted automatically. Mark papers with
`selected: true` to feature them on the home page. Otherwise the home page shows
the five most recent. Add `bibtex` or `abstract` to get expandable
BibTeX/Abstract buttons.

## Previewing locally (optional)

Requires Ruby 3.x.

```sh
bundle install
bundle exec jekyll serve --livereload
```

Then open <http://localhost:4000>.

## Structure

```
_config.yml          site settings
_data/               all content (profile, news, publications, ...)
_includes/           header, footer, icons, publication entry
_layouts/            default, home, page
assets/css/main.css  all styles (colors are CSS variables at the top; light + dark mode)
assets/js/main.js    dark-mode toggle, BibTeX/abstract toggles, spam-safe email link
index.md             home page / bio
publications.html    full publication list, grouped by year
teaching.html        teaching page
talks.html           talks page
404.html             not-found page
```
