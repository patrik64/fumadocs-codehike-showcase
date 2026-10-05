import { type AnnotationHandler, type HighlightedCode, InnerLine } from 'codehike/code';

// The digit is drawn by CSS from `data-value`, so it never becomes part of a
// text selection or of what the browser copies.
function Marker({ n }: { n: number }) {
  return (
    <span
      data-value={n}
      className="inline-block size-4 shrink-0 self-center rounded-full border border-fd-muted-foreground/60 text-center font-mono text-[10px] leading-[14px] text-fd-muted-foreground after:content-[attr(data-value)]"
    />
  );
}

// `// !ref Some note` — the line gets a number here, and `Code` prints the
// notes under the block with `<Footnotes>`
export const footnotes: AnnotationHandler = {
  name: 'ref',
  AnnotatedLine: ({ annotation, ...props }) => (
    <div className="flex gap-2">
      <InnerLine merge={props} />
      <Marker n={annotation.data.n} />
    </div>
  ),
};

// Gives every `!ref` its number. Returns a copy rather than writing `data`
// onto the annotations, because the codeblock is a prop.
export function numberFootnotes(codeblock: HighlightedCode) {
  const notes: string[] = [];
  const annotations = codeblock.annotations.map((annotation) => {
    if (annotation.name !== 'ref') return annotation;
    notes.push(annotation.query);
    return { ...annotation, data: { ...annotation.data, n: notes.length } };
  });

  return { code: { ...codeblock, annotations }, notes };
}

export function Footnotes({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;

  return (
    <ul className="space-y-1 border-t bg-fd-card px-3 py-2 text-sm">
      {notes.map((note, i) => (
        <li key={i} className="flex items-center gap-2">
          <Marker n={i + 1} />
          {note}
        </li>
      ))}
    </ul>
  );
}
