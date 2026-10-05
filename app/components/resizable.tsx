import type { ReactNode } from 'react';

// Stands in for the resizable panel of Code Hike's word-wrap demo. CSS
// `resize` has the browser draw a drag handle in the bottom-right corner, so
// there is no script; it only takes effect on a box that clips its overflow.
export function Resizable({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 w-80 max-w-full min-w-64 resize-x overflow-hidden rounded-lg *:my-0">
      {children}
    </div>
  );
}
