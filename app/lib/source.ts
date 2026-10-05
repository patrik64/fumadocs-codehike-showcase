import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { docsContentRoute, docsRoute } from './shared';

// Code Hike is wired into the MDX pipeline via `globalOptions` in
// vite.config.ts — this module is imported by the browser, so compiler-side
// plugins must not be imported here.
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    postprocess: {
      // exposes `page.data.extractedReferences`, which build-graph.ts turns
      // into the edges of the graph view
      extractLinkReferences: true,
    },
  },
});

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
});

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: '/' + [page.locale, ...docsContentRoute.split('/'), ...segments].filter(Boolean).join('/'),
  };
}

// Raw source rather than fumadocs' processed markdown: remarkCodeHike runs
// before fumadocs' plugins (see vite.config.ts), so by the time the processed
// markdown is serialized every code fence has become a `<Code />` element whose
// code lives in a prop, and `## !!steps` sections have become `<slot>`
// wrappers — the processed text contains no code at all. Only ever called from
// the prerendered llms routes, so reading the file from disk is fine.
export async function getLLMText(page: (typeof source)['$inferPage']) {
  const raw = await page.data.getText('raw');
  const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '').trim();

  return `# ${page.data.title} (${page.url})

${body}`;
}
