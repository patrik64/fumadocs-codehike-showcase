import { Block, HighlightedCodeBlock, parseProps } from 'codehike/blocks';
import type { HighlightedCode } from 'codehike/code';
import { TabsContent, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';
import { Tabs } from 'fumadocs-ui/components/ui/tabs';
import { useState } from 'react';
import { z } from 'zod';
import { CodeBody, CopyButton, codeLabel } from './code';

const Schema = Block.extend({
  tabs: z.array(HighlightedCodeBlock),
});

// Code Hike's tabs example with Fumadocs' tabs in place of shadcn's: every
// fence marked `!!tabs` is one tab, titled like a plain block's header. The
// root is the unstyled primitive because it can be controlled, which the copy
// button needs to know which tab is showing.
export function CodeWithTabs(props: unknown) {
  // explicit because codehike's zod-derived types don't survive this repo's TS setup
  const { tabs } = parseProps(props, Schema) as { tabs: HighlightedCode[] };
  const [active, setActive] = useState('0');

  return (
    <Tabs
      value={active}
      onValueChange={setActive}
      className="not-prose my-6 overflow-hidden rounded-lg border bg-(--ch-16)"
    >
      <div className="flex items-center gap-2 border-b bg-fd-secondary/50 px-3">
        <TabsList className="flex-1 px-0">
          {tabs.map((tab, i) => (
            <TabsTrigger key={i} value={String(i)} className="font-mono text-xs">
              {codeLabel(tab)}
            </TabsTrigger>
          ))}
        </TabsList>
        <CopyButton text={tabs[Number(active)].code} />
      </div>
      {/* Base UI keeps the outgoing panel mounted for a frame or two while it
          waits for exit animations; hiding it at once stops the two panels
          from showing stacked in the meantime */}
      {tabs.map((tab, i) => (
        <TabsContent
          key={i}
          value={String(i)}
          className="rounded-none bg-transparent p-0 data-[ending-style]:hidden"
        >
          <CodeBody codeblock={tab} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
