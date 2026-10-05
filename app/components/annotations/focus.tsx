import { type AnnotationHandler, InnerLine, InnerPre, getPreRef } from 'codehike/code';
import { type RefObject, useLayoutEffect, useRef } from 'react';

// When the block is shorter than its code, keep the focused lines in view.
// Runs after every render, so it follows the focus when the annotations change.
function useScrollToFocus(ref: RefObject<HTMLPreElement | null>) {
  const firstRender = useRef(true);

  useLayoutEffect(() => {
    const pre = ref.current;
    if (!pre) return;

    const preRect = pre.getBoundingClientRect();
    let top = Infinity;
    let bottom = -Infinity;
    pre.querySelectorAll<HTMLElement>('[data-focus=true]').forEach((line) => {
      const rect = line.getBoundingClientRect();
      top = Math.min(top, rect.top - preRect.top);
      bottom = Math.max(bottom, rect.bottom - preRect.top);
    });

    // only scroll if part of the focused code is out of sight
    if (bottom > preRect.height || top < 0) {
      pre.scrollTo({
        top: pre.scrollTop + top - 10,
        behavior: firstRender.current ? 'instant' : 'smooth',
      });
    }
    firstRender.current = false;
  });
}

const PreWithFocus: AnnotationHandler['PreWithRef'] = (props) => {
  const ref = getPreRef(props);
  useScrollToFocus(ref);

  return <InnerPre merge={props} />;
};

// `// !focus(1:3)` — those lines keep full strength and every other line of
// the block dims. The band behind them is a wrapper rather than a class on the
// line, so it can bleed into the pre's padding whatever the other handlers do
// to the line itself.
export const focus: AnnotationHandler = {
  name: 'focus',
  onlyIfAnnotated: true,
  PreWithRef: PreWithFocus,
  Line: (props) => <InnerLine merge={props} className="opacity-50 data-[focus]:opacity-100" />,
  AnnotatedLine: (props) => (
    <div className="-mx-2 bg-fd-foreground/5 px-2">
      <InnerLine merge={props} data-focus={true} />
    </div>
  ),
};
