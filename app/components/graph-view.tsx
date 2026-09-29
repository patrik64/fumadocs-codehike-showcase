'use client';
import { lazy, type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ForceGraphMethods,
  ForceGraphProps,
  LinkObject,
  NodeObject,
} from 'react-force-graph-2d';
import { forceCollide, forceLink, forceManyBody } from 'd3-force';
import { useRouter } from 'fumadocs-core/framework';

export interface Graph {
  links: Link[];
  nodes: Node[];
}

export type Node = NodeObject<NodeType>;
export type Link = LinkObject<NodeType, LinkType>;

export interface NodeType {
  text: string;
  description?: string;
  neighbors?: string[];
  url: string;
}

export type LinkType = Record<string, unknown>;

export interface GraphViewProps {
  graph: Graph;
}

const ForceGraph2D = lazy(
  () => import('react-force-graph-2d'),
) as typeof import('react-force-graph-2d').default;

export function GraphView(props: GraphViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  useEffect(() => {
    setMount(true);
  }, []);

  return (
    <div
      ref={ref}
      className="relative border h-[600px] [&_canvas]:size-full rounded-xl overflow-hidden bg-fd-background"
    >
      {mount && <ClientOnly {...props} containerRef={ref} />}
    </div>
  );
}

function ClientOnly({
  containerRef,
  graph,
}: GraphViewProps & { containerRef: RefObject<HTMLDivElement | null> }) {
  const graphRef = useRef<ForceGraphMethods<Node, Link> | undefined>(undefined);
  const hoveredRef = useRef<Node | null>(null);
  // Without explicit dimensions react-force-graph sizes its canvas to the
  // window, so the drawing area ends up larger than this container and the
  // graph drifts out of view. Measure the box and hand it the real size.
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Stock configures the d3 forces inside a getter/setter passed as `ref`.
  // That never ran here, so the graph kept d3's defaults (link distance 30)
  // and all six nodes piled onto a single point. The instance arrives late
  // because ForceGraph2D is lazily imported, hence the rAF retry.
  useEffect(() => {
    let frame = 0;

    const applyForces = () => {
      const fg = graphRef.current;
      if (!fg) {
        frame = requestAnimationFrame(applyForces);
        return;
      }

      fg.d3Force('link', forceLink().distance(160));
      // negative repels; a positive charge would pull every node together
      fg.d3Force('charge', forceManyBody().strength(-120));
      fg.d3Force('collision', forceCollide(50));
      fg.d3ReheatSimulation();
    };

    applyForces();

    return () => cancelAnimationFrame(frame);
  }, [graph]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [containerRef]);
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);

  const handleNodeHover = (node: Node | null) => {
    const graph = graphRef.current;
    if (!graph) return;
    hoveredRef.current = node;

    if (node) {
      const coords = graph.graph2ScreenCoords(node.x!, node.y!);
      setTooltip({
        x: coords.x + 4,
        y: coords.y + 4,
        content: node.description ?? 'No description',
      });
    } else {
      setTooltip(null);
    }
  };

  // Custom node rendering: circle with text label below
  const nodeCanvasObject: ForceGraphProps['nodeCanvasObject'] = (node, ctx) => {
    const container = containerRef.current;
    if (!container) return;
    const style = getComputedStyle(container);
    const fontSize = 9;
    const radius = 5;

    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);

    const hoverNode = hoveredRef.current;
    const isActive = hoverNode?.id === node.id || hoverNode?.neighbors?.includes(node.id as string);

    ctx.fillStyle = isActive
      ? style.getPropertyValue('--color-fd-primary')
      : style.getPropertyValue('--color-purple-300');
    ctx.fill();

    // Draw text below the node
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = getComputedStyle(container).getPropertyValue('color');
    ctx.fillText(node.text, node.x!, node.y! + radius + fontSize);
  };

  const linkColor = (link: Link) => {
    const container = containerRef.current;
    if (!container) return '#999';
    const style = getComputedStyle(container);
    const hoverNode = hoveredRef.current;

    if (
      hoverNode &&
      typeof link.source === 'object' &&
      typeof link.target === 'object' &&
      (hoverNode.id === link.source.id || hoverNode.id === link.target.id)
    ) {
      return style.getPropertyValue('--color-fd-primary');
    }

    return `color-mix(in oklab, ${style.getPropertyValue('--color-fd-muted-foreground')} 50%, transparent)`;
  };

  // Enrich nodes with neighbors for hover effects
  const enrichedNodes = useMemo(() => {
    const { nodes, links } = structuredClone(graph);
    for (const node of nodes) {
      node.neighbors = links.flatMap((link) => {
        if (link.source === node.id) return link.target as string;
        if (link.target === node.id) return link.source as string;
        return [];
      });
    }

    return {
      nodes,
      links,
    };
  }, [graph]);

  if (size.width === 0) return null;

  return (
    <>
      <ForceGraph2D<NodeType, LinkType>
        width={size.width}
        height={size.height}
        ref={graphRef}
        graphData={enrichedNodes}
        nodeCanvasObject={nodeCanvasObject}
        linkColor={linkColor}
        onNodeHover={handleNodeHover}
        onNodeClick={(node) => {
          router.push(node.url);
        }}
        // now that `graphRef` is actually populated this runs: the simulation
        // settles wider than the container, so frame it once it comes to rest
        onEngineStop={() => graphRef.current?.zoomToFit(400, 50)}
        linkWidth={2}
        enableNodeDrag
        enableZoomInteraction
      />
      {tooltip && (
        <div
          className="absolute bg-fd-popover text-fd-popover-foreground size-fit p-2 border rounded-xl shadow-lg text-sm max-w-xs"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
}
