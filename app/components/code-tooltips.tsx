import { Block, HighlightedCodeBlock, parseProps } from 'codehike/blocks';
import type { HighlightedCode } from 'codehike/code';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { Code } from './code';

const Schema = Block.extend({
  code: HighlightedCodeBlock,
  tooltips: z.array(Block).optional(),
});

// Code Hike's tooltip example: one fence marked `!code`, plus a
// `## !!tooltips name` section for every tooltip that needs more than plain
// text. An annotation whose text is a section's name gets that section's MDX
// as `data.children`, which is what the `tooltip` handler renders.
export function CodeWithTooltips(props: unknown) {
  // explicit because codehike's zod-derived types don't survive this repo's TS setup
  const { code, tooltips = [] } = parseProps(props, Schema) as {
    code: HighlightedCode;
    tooltips?: { title?: string; children?: ReactNode }[];
  };

  const annotations = code.annotations.map((annotation) => {
    if (annotation.name !== 'tooltip') return annotation;

    const section = tooltips.find((tooltip) => tooltip.title === annotation.query);
    if (!section) return annotation;

    return { ...annotation, data: { ...annotation.data, children: section.children } };
  });

  return <Code codeblock={{ ...code, annotations }} />;
}
