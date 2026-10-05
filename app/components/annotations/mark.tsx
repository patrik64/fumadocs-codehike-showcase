import { type AnnotationHandler, InnerLine } from 'codehike/code';

// follows the fumadocs theme (and its light/dark values); an explicit colour
// in the annotation (`!mark gold`, or the diff handler's red/green) still wins
const DEFAULT_COLOR = 'var(--color-fd-primary)';

// `// !mark` or `// !mark(1:3) gold` — highlights lines
// `!mark[/regex/]` — highlights inline matches
export const mark: AnnotationHandler = {
  name: 'mark',
  Line: ({ annotation, ...props }) => {
    const color = annotation?.query || DEFAULT_COLOR;
    return (
      <div
        // one `borderLeft`, not a transparent one plus an optional
        // `borderLeftColor`: handed `undefined` for the colour, React clears it
        // when it renders on the client, and the theme's border colour shows
        style={{
          borderLeft: `solid 2px ${annotation ? color : 'transparent'}`,
          backgroundColor: annotation ? `rgb(from ${color} r g b / 0.13)` : undefined,
        }}
        className="flex"
      >
        <InnerLine merge={props} className="flex-1 px-3" />
      </div>
    );
  },
  Inline: ({ annotation, children }) => {
    const color = annotation?.query || DEFAULT_COLOR;
    return (
      <span
        className="-mx-0.5 rounded px-0.5 py-0"
        style={{
          outline: `solid 1px rgb(from ${color} r g b / 0.5)`,
          background: `rgb(from ${color} r g b / 0.13)`,
        }}
      >
        {children}
      </span>
    );
  },
};
