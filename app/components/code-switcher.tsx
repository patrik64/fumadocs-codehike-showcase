import { Block, HighlightedCodeBlock, parseProps } from 'codehike/blocks';
import { type HighlightedCode, Pre } from 'codehike/code';
import { useState } from 'react';
import { z } from 'zod';
import { focus } from './annotations/focus';
import { tokenTransitions } from './annotations/token-transitions';

const Schema = Block.extend({
  versions: z.array(HighlightedCodeBlock),
  label: z.string().optional(),
});

// Code Hike's token-transitions demo: every fence marked `!!versions` inside
// the tag is one version of the code, and the button cycles through them.
// It has to stay a single `Pre` whose `code` prop changes — the handler
// animates on update, so a remount between versions would skip the animation.
// `focus` rides along, so two versions can also differ only in what they focus.
export function CodeSwitcher(props: unknown) {
  // explicit because codehike's zod-derived types don't survive this repo's TS setup
  const { versions, label } = parseProps(props, Schema) as {
    versions: HighlightedCode[];
    label?: string;
  };
  const [index, setIndex] = useState(0);

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border">
      {/* a fixed height: the button stays put between versions, and longer
          code scrolls inside it, which is what `!focus` needs to show off */}
      <Pre
        code={versions[index]}
        handlers={[tokenTransitions, focus]}
        className="m-0 h-64 overflow-auto bg-(--ch-16) px-4 py-4 text-[13px] leading-6"
      />
      <div className="flex justify-center border-t bg-fd-secondary/50 px-3 py-2">
        <button
          type="button"
          className="rounded border px-3 py-1 text-xs font-medium text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
          onClick={() => setIndex((index + 1) % versions.length)}
        >
          {label ?? 'Switch code'}
        </button>
      </div>
    </div>
  );
}
