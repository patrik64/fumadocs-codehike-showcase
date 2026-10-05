import type { AnnotationHandler } from 'codehike/code';
import { useState } from 'react';

const InlineFold: AnnotationHandler['Inline'] = ({ children }) => {
  const [folded, setFolded] = useState(true);
  if (!folded) return children;

  return (
    <button
      type="button"
      aria-label="Expand"
      className="rounded bg-fd-muted px-1 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
      onClick={() => setFolded(false)}
    >
      ...
    </button>
  );
};

// `// !fold[/className="(.*?)"/gm]` — hides every match behind an ellipsis
// until it is clicked; with a capture group, only the group is hidden
export const fold: AnnotationHandler = {
  name: 'fold',
  Inline: InlineFold,
};
