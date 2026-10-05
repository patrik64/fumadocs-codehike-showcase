import { Block, HighlightedCodeBlock, parseProps } from 'codehike/blocks';
import { type HighlightedCode, Pre } from 'codehike/code';
import type { ReactNode } from 'react';
import { Selectable, Selection, SelectionProvider } from 'codehike/utils/selection';
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

interface SpotlightProps {
  steps: Step[];
}

// Like scrollycoding, but steps are selected by click instead of scroll.
export function Spotlight(props: unknown) {
  const { steps } = parseProps(props, Schema) as SpotlightProps;

  return (
    <SelectionProvider className="my-8 flex flex-col gap-4 lg:flex-row lg:gap-6">
      <div className="flex-1">
        {steps.map((step, i) => (
          <Selectable
            key={i}
            index={i}
            selectOn={['click']}
            className="mb-4 cursor-pointer rounded border border-fd-border bg-fd-card px-5 py-2 transition-colors duration-200 ease-in-out hover:bg-fd-accent/50 data-[selected=true]:border-fd-primary"
          >
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <div>{step.children}</div>
          </Selectable>
        ))}
      </div>
      <div className="w-full lg:w-[45%] lg:max-w-2xl">
        <div className="sticky top-20 overflow-hidden rounded-lg border bg-(--ch-16)">
          <div className="max-h-[calc(100vh-7rem)] overflow-auto">
            {/* no per-step `key` on the panel: a changing key would remount
                the Pre, and token transitions only run when it updates in
                place */}
            <Selection
              from={steps.map((step) => (
                <Pre
                  code={step.code}
                  handlers={[tokenTransitions, mark]}
                  className="m-0 min-h-96 px-4 py-4 text-[13px] leading-6"
                />
              ))}
            />
          </div>
        </div>
      </div>
    </SelectionProvider>
  );
}
