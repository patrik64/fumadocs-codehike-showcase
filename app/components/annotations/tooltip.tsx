import type { AnnotationHandler } from 'codehike/code';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';

// `// !tooltip[/regex/] text` — the match becomes a trigger and the text its
// tooltip. Inside `<CodeWithTooltips>` the text names a `## !!tooltips`
// section instead, and that section's MDX arrives here as `data.children`.
// It is a popover that also opens on hover rather than a strict tooltip,
// because the content can be interactive: a link, a block with a copy button.
export const tooltip: AnnotationHandler = {
  name: 'tooltip',
  Inline: ({ children, annotation }) => (
    <Popover>
      <PopoverTrigger
        openOnHover
        className="cursor-pointer underline decoration-dashed underline-offset-4"
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-fit max-w-[min(24rem,98vw)] flex-col gap-2 [&_p_code]:rounded [&_p_code]:bg-fd-muted [&_p_code]:px-1 [&_p_code]:font-mono [&_p_code]:text-[0.85em] [&>.not-prose]:my-0"
      >
        {annotation.data?.children ?? annotation.query}
      </PopoverContent>
    </Popover>
  ),
};
