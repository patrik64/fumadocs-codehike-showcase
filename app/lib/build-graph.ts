import { source } from '@/lib/source';
import type { Graph } from '@/components/graph-view';

// Adapted from `npx @fumadocs/cli add graph-view`. The generated version reads
// `page.data.extractedReferences` synchronously, which only works on an eager
// collection — this repo loads docs content lazily (`async: true` in
// app/lib/source.ts), so the references arrive with `load()`.
export async function buildGraph(): Promise<Graph> {
  const pages = source.getPages();
  const loaded = await Promise.all(pages.map((page) => page.data.load()));
  const graph: Graph = { links: [], nodes: [] };

  pages.forEach((page, i) => {
    graph.nodes.push({
      id: page.url,
      url: page.url,
      text: page.data.title,
      description: page.data.description,
    });

    for (const ref of loaded[i].extractedReferences ?? []) {
      const refPage = source.getPageByHref(ref.href);
      if (!refPage) continue;

      graph.links.push({
        source: page.url,
        target: refPage.page.url,
      });
    }
  });

  return graph;
}
