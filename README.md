# Fumadocs × Code Hike Showcase

A React application that showcases
[Fumadocs](https://fumadocs.dev) and [Code Hike](https://codehike.org)
working together — with Code Hike's **scrollycoding** feature as the
centerpiece.

- **Fumadocs** provides the docs framework: layout, sidebar, table of
  contents, full-text search (Orama), light/dark theming. It runs on
  React Router's Vite plugin in SPA mode with full prerendering, and
  content is compiled by `fumadocs-mdx`.
- **Code Hike** renders every code block: compile-time syntax
  highlighting, comment-driven annotations, and interactive layouts.

## Getting started

```sh
pnpm install
pnpm dev        # dev server
pnpm build      # production build (prerenders all pages)
pnpm start      # serve the production build
```

## Pages

| Page | What it shows |
| --- | --- |
| `/docs` | Intro + how the integration is wired |
| `/docs/scrollycoding` | Scroll-driven code walkthrough with animated token transitions |
| `/docs/spotlight` | Click-driven variant of the same step syntax |
| `/docs/slideshow` | Prev/next-controlled slides over the same step syntax |
| `/docs/annotations` | `!mark`, `!callout`, `!diff`, line numbers, file names |

## How the integration works

1. **Plugin wiring** — `vite.config.ts` adds Code Hike's remark/recma
   plugin pair to the `fumadocs-mdx` pipeline via the plugin's
   `globalOptions.mdxOptions`. It lives there (not in
   `app/lib/source.ts`) because the source module is also imported by
   the browser, and the compiler plugins are Node-only — in dev, where
   nothing is tree-shaken, they would crash the docs route.
   `remarkCodeHike` runs *before* fumadocs' plugins so `## !!steps`
   headings inside `<Scrollycoding>` never leak into the table of
   contents.
2. **Compile-time highlighting** — the Code Hike config sets
   `syntaxHighlighting.theme: "github-from-css"`, so code is highlighted
   at build time (no client-side highlighter is shipped) and token
   colors resolve to the `--ch-*` CSS variables in `app/app.css`,
   following fumadocs' light/dark toggle.
3. **Custom code component** — `components.code: "Code"` routes every
   MDX code fence through `app/components/code.tsx` (header with file
   name, copy button, annotation handlers).
4. **Layouts** — `app/components/scrollycoding.tsx` and `spotlight.tsx`
   use Code Hike's `SelectionProvider`/`Selectable`/`Selection`
   utilities with the `token-transitions` handler for animated code
   morphing. Pages using them set `full: true` in frontmatter for a
   wide layout.
5. **Annotation handlers** — `app/components/annotations/` contains the
   handlers (`mark`, `callout`, `diff`, `line-numbers`,
   `token-transitions`), adapted from the Code Hike docs.

## Notes

- Zod is pinned to v4 to match fumadocs; Code Hike's runtime works with
  it, and the scrollycoding/spotlight components type their parsed
  props explicitly.
- `serve.json` deliberately has no SPA rewrite: every route is
  prerendered, and the catch-all rewrite in the original template
  shadowed the prerendered HTML files.
