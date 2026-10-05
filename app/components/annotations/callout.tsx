import { type AnnotationHandler, type InlineAnnotation, InnerLine } from 'codehike/code';

// `// !callout[/regex/] message` — speech-bubble note anchored under the match
export const callout: AnnotationHandler = {
  name: 'callout',
  transform: (annotation: InlineAnnotation) => {
    const { name, query, lineNumber, fromColumn, toColumn, data } = annotation;
    return {
      name,
      query,
      fromLineNumber: lineNumber,
      toLineNumber: lineNumber,
      data: { ...data, column: (fromColumn + toColumn) / 2 },
    };
  },
  // The bubble is the last thing inside its line rather than a block after
  // it, so it starts where the code starts whatever another handler puts in
  // front (a line number, the diff sign) and the arrow stays under the match.
  AnnotatedLine: ({ annotation, ...props }) => {
    const { column } = annotation.data as { column: number };
    return (
      <InnerLine merge={props}>
        {props.children}
        <div
          style={{ minWidth: `${column + 4}ch` }}
          className="relative mt-1 w-fit whitespace-break-spaces rounded border border-fd-primary/50 bg-fd-secondary px-2 text-fd-secondary-foreground"
        >
          {/* `column` counts from 1, hence the half character; the 5px are
              half the arrow's width plus the bubble's border */}
          <div
            style={{ left: `calc(${column - 0.5}ch - 5px)` }}
            className="absolute -top-px h-2 w-2 -translate-y-1/2 rotate-45 border-t border-l border-fd-primary/50 bg-fd-secondary"
          />
          {annotation.query}
        </div>
      </InnerLine>
    );
  },
};
