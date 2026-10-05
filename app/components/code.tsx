import { type HighlightedCode, Pre } from 'codehike/code';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { callout } from './annotations/callout';
import { diff } from './annotations/diff';
import { focus } from './annotations/focus';
import { fold } from './annotations/fold';
import { Footnotes, footnotes, numberFootnotes } from './annotations/footnotes';
import { hover } from './annotations/hover';
import { lineNumbers } from './annotations/line-numbers';
import { mark } from './annotations/mark';
import { tooltip } from './annotations/tooltip';
import { wordWrap } from './annotations/word-wrap';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="rounded p-1 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
      aria-label="Copy to clipboard"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

// Code Hike's highlighter normalizes `sh` and `bash` to `shellscript`, which
// reads badly as a header label.
const langLabels: Record<string, string> = {
  shellscript: 'Terminal',
};

// The header label, and a tab's title in `CodeWithTabs`: the first word of
// the fence meta with a dot in it, else the language.
export function codeLabel(codeblock: HighlightedCode) {
  const flags = codeblock.meta.split(' ').filter(Boolean);
  const filename = flags.find((f) => f.includes('.'));

  return filename ?? langLabels[codeblock.lang] ?? codeblock.lang;
}

// The lines themselves, with every annotation handler and the footnote list.
// `Code` and `CodeWithTabs` both render through it, so a tab can do whatever
// a plain block can.
export function CodeBody({ codeblock }: { codeblock: HighlightedCode }) {
  const flags = codeblock.meta.split(' ').filter(Boolean);
  const { code, notes } = numberFootnotes(codeblock);

  const handlers = [callout, diff, focus, fold, footnotes, hover, mark, tooltip];
  if (flags.includes('-n')) handlers.push(lineNumbers);
  if (flags.includes('-w')) handlers.push(wordWrap);

  return (
    <>
      <Pre
        code={code}
        handlers={handlers}
        className="m-0 overflow-auto px-3 py-3 text-[13px] leading-6"
      />
      <Footnotes notes={notes} />
    </>
  );
}

// All MDX code fences render through this component (see `components.code`
// in the Code Hike config). The codeblock arrives already highlighted at
// compile time, so no async work happens here.
export function Code({ codeblock }: { codeblock: HighlightedCode }) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border bg-(--ch-16)">
      <div className="flex items-center gap-2 border-b bg-fd-secondary/50 px-3 py-1.5">
        <span className="flex-1 font-mono text-xs text-fd-muted-foreground">
          {codeLabel(codeblock)}
        </span>
        <CopyButton text={codeblock.code} />
      </div>
      <CodeBody codeblock={codeblock} />
    </div>
  );
}
