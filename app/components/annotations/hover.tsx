import { type AnnotationHandler, InnerLine } from 'codehike/code';
import { type ReactNode, createContext, useContext, useState } from 'react';

// Code mentions: `[text](hover:name)` in the prose points at the lines marked
// `// !hover name` in a code block. The Code Hike docs wire the two together
// with one CSS rule per name; a context holding the active name does the same
// for any name, and lets keyboard focus trigger it too.
const HoverContext = createContext<{
  active: string | null;
  setActive: (name: string | null) => void;
}>({ active: null, setActive: () => {} });

// wraps the prose and the code block that belong together
export function HoverContainer({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);

  return <HoverContext value={{ active, setActive }}>{children}</HoverContext>;
}

// what a `hover:` link renders as (see the `a` override in mdx.tsx)
export function HoverMention({ name, children }: { name: string; children: ReactNode }) {
  const { setActive } = useContext(HoverContext);

  return (
    <span
      tabIndex={0}
      className="cursor-default rounded-sm underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      onMouseEnter={() => setActive(name)}
      onMouseLeave={() => setActive(null)}
      onFocus={() => setActive(name)}
      onBlur={() => setActive(null)}
    >
      {children}
    </span>
  );
}

// `// !hover name` — while the mention called `name` is active, every other
// line of the block dims
export const hover: AnnotationHandler = {
  name: 'hover',
  onlyIfAnnotated: true,
  Line: ({ annotation, ...props }) => {
    const { active } = useContext(HoverContext);
    const dimmed = active !== null && annotation?.query !== active;

    return (
      <InnerLine merge={props} className={`transition-opacity ${dimmed ? 'opacity-40' : ''}`} />
    );
  },
};
