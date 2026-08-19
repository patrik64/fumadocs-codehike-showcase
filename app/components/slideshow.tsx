import { Block, HighlightedCodeBlock, parseProps } from 'codehike/blocks';
import { type HighlightedCode, Pre } from 'codehike/code';
import {
  Selection,
  SelectionProvider,
  useSelectedIndex,
} from 'codehike/utils/selection';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { mark } from './annotations/mark';
import { tokenTransitions } from './annotations/token-transitions';

const Schema = Block.extend({
  steps: z.array(Block.extend({ code: HighlightedCodeBlock })),
});

// explicit because codehike's zod-derived types don't survive this repo's TS setup
interface Step {
  title?: string;
  children?: ReactNode;
  code: HighlightedCode;
}

function Controls({ length }: { length: number }) {
  const [selectedIndex, setSelectedIndex] = useSelectedIndex();

  return (
    <div className="flex items-center justify-center gap-1 border-t bg-fd-secondary/50 px-3 py-2">
      <button
        type="button"
        aria-label="Previous step"
        disabled={selectedIndex === 0}
        className="mr-3 rounded p-1 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-40"
        onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
      >
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to step ${i + 1}`}
          className={`h-2 w-2 cursor-pointer rounded-full ${
            selectedIndex === i ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40 hover:bg-fd-muted-foreground'
          }`}
          onClick={() => setSelectedIndex(i)}
        />
      ))}
      <button
        type="button"
        aria-label="Next step"
        disabled={selectedIndex === length - 1}
        className="ml-3 rounded p-1 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-40"
        onClick={() => setSelectedIndex(Math.min(length - 1, selectedIndex + 1))}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// Code Hike's slideshow pattern: the same `## !!steps` blocks as
// scrollycoding, but the selected step is driven by prev/next controls
// instead of scrolling. Token transitions animate between slides.
export function Slideshow(props: unknown) {
  const { steps } = parseProps(props, Schema) as { steps: Step[] };

  return (
    <SelectionProvider className="not-prose my-6 overflow-hidden rounded-lg border">
      <div className="bg-[var(--ch-16)]">
        <Selection
          from={steps.map((step, i) => (
            <Pre
              key={i}
              code={step.code}
              handlers={[tokenTransitions, mark]}
              className="m-0 min-h-[22rem] overflow-auto px-4 py-4 text-[13px] leading-6"
            />
          ))}
        />
      </div>
      <Controls length={steps.length} />
      <div className="border-t bg-fd-card px-4 py-3 text-sm">
        <Selection
          from={steps.map((step, i) => (
            <div key={i}>
              <div className="mb-1 font-semibold">{step.title}</div>
              <div className="text-fd-muted-foreground [&_code]:rounded [&_code]:bg-fd-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em]">
                {step.children}
              </div>
            </div>
          ))}
        />
      </div>
    </SelectionProvider>
  );
}
