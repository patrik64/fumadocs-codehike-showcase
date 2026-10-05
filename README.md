# Fumadocs × Code Hike Showcase

A React application that showcases
[Fumadocs](https://fumadocs.dev) and [Code Hike](https://codehike.org)
working together — with Code Hike's **scrollycoding** feature as the
centerpiece.

- **Fumadocs** provides the docs framework: layout, sidebar, table of
  contents, full-text search (Orama), light/dark theming, plus a set of
  MDX components (cards, callouts, tabs, steps, file trees). It runs on
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
| `/docs/fumadocs-ui` | The fumadocs UI components, with Code Hike blocks inside them, plus the graph view |
| `/docs/annotations` | `!mark`, `!callout`, `!diff`, `!focus`, `!fold`, line numbers, file names, copy button, code mentions, token transitions |
| `/docs/scrollycoding` | Scroll-driven code walkthrough with animated token transitions |
| `/docs/spotlight` | Click-driven variant of the same step syntax |
| `/docs/slideshow` | Prev/next-controlled slides over the same step syntax |

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
4. **MDX component registry** — `app/components/mdx.tsx` is where the two
   libraries meet: fumadocs' `defaultMdxComponents` and its opt-in
   components (`Tabs`, `Steps`, `Accordions`, `Files`, `TypeTable`,
   `ImageZoom`, `InlineTOC`, `Banner`) sit in the same object as our Code
   Hike ones (`Code`, `CodeSwitcher`, `HoverContainer`, `Scrollycoding`,
   `Spotlight`, `Slideshow`). A code fence inside a fumadocs `<Tab>` is
   still a Code Hike block, annotations included. `PageGraph` wraps the
   graph view so the MDX tag needs no props, and the `a` component is
   wrapped so `[text](hover:name)` links become code mentions.
5. **Layouts** — `app/components/scrollycoding.tsx` and `spotlight.tsx`
   use Code Hike's `SelectionProvider`/`Selectable`/`Selection`
   utilities with the `token-transitions` handler for animated code
   morphing. Pages using them set `full: true` in frontmatter for a
   wide layout.
6. **Annotation handlers** — `app/components/annotations/` contains the
   handlers (`mark`, `callout`, `diff`, `focus`, `fold`, `hover`,
   `line-numbers`, `token-transitions`), adapted from the Code Hike docs.
   `app/components/code-switcher.tsx` is the smallest use of the last
   one: a single `Pre` whose code changes on click. It carries `focus`
   too, so two versions can differ only in what they focus. `hover` (code
   mentions) keeps the active mention in React context rather than in
   the per-name CSS rules the docs use, so any mention name works.

## Notes

- Zod is pinned to v4 to match fumadocs; Code Hike's runtime works with
  it, and the scrollycoding/spotlight components type their parsed
  props explicitly.
- `serve.json` deliberately has no SPA rewrite: every route is
  prerendered, and the catch-all rewrite in the original template
  shadowed the prerendered HTML files.
- Code Hike owns the code fences, so fumadocs' own `CodeBlock` and
  `CodeBlockTabs` are unused — they expect a `<pre>` child that
  `components.code` never produces. Pick one owner for code blocks.
- fumadocs' `GithubInfo` is deliberately not used: it calls the GitHub
  API while rendering, which on a fully prerendered site means during
  `pnpm build`, so a rate limit would break the build.
- `Banner` ships as `sticky top-0 z-40`, which is right at the app root
  but pins it over the article when used inside a page —
  `/docs/fumadocs-ui` overrides it to `relative`.
- Code Hike's highlighter normalizes `sh` and `bash` to `shellscript`;
  `app/components/code.tsx` maps that to a friendlier header label.
- The pipeline diagram in `public/` has light and dark variants swapped
  on fumadocs' `.dark` class, since an `<img>` can't read the site's
  theme.

## Graph view

`app/components/graph-view.tsx` and `app/lib/build-graph.ts` come from
`npx @fumadocs/cli add graph-view` — the CLI copies the source into the
project rather than exporting a component, so these files are ours to
maintain. They bring `react-force-graph-2d` and `d3-force` with them, and
`app/lib/source.ts` sets `extractLinkReferences: true` so each page
carries the Markdown links that become the graph's edges.

Three changes were needed to make the generated code work here:

- **`buildGraph()` is async.** The generated version reads
  `page.data.extractedReferences` synchronously, which only exists on an
  eager collection. This repo sets `async: true`, so the references
  arrive with `load()`.
- **The canvas needs explicit dimensions.** Without them
  `react-force-graph` sizes its canvas to the window — measurably larger
  than the 600px container it is drawn into — so the component measures
  the box with a `ResizeObserver` and passes the result.
- **The d3 forces are configured in an effect**, not in the getter/setter
  object the generated code passes as `ref`.

`PageGraph` builds the graph in an effect rather than during render:
`buildGraph()` loads every page's content, and the prerender should not
wait on that for a canvas that is client-only anyway.
