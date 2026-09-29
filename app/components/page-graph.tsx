import { useEffect, useState } from 'react';
import { buildGraph } from '@/lib/build-graph';
import { type Graph, GraphView } from './graph-view';

// Wrapper so the MDX tag needs no props. The graph is built in an effect
// rather than with `use()` because it loads every page's content: doing that
// during render would make the prerender wait on all of them, and the graph
// canvas is client-only anyway.
export function PageGraph() {
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    let cancelled = false;
    void buildGraph().then((result) => {
      if (!cancelled) setGraph(result);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!graph) return <div className="h-[600px] rounded-xl border bg-fd-background" aria-hidden />;

  return <GraphView graph={graph} />;
}
