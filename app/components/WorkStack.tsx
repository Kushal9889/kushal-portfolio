"use client";

import { useLayoutEffect } from "react";

/**
 * Cumulative sticky offsets for the Work section's role identities.
 *
 * `.roleHead` in page.module.css is `position: sticky`, and every role wants
 * to stay visible once reached rather than swap out for the next one -- the
 * accumulation itself is the point, a reader watching the list of roles grow
 * as they scroll. Sticky alone cannot do that: two siblings both stuck at the
 * same `top` overlap each other. Each role after the first needs `top` pushed
 * down by exactly the rendered height of every role above it, and that
 * height depends on the role's own title length, so it cannot be a constant
 * in the stylesheet.
 *
 * Measured rather than guessed, and re-measured on resize: a role's title
 * wraps to a different number of lines at a different viewport width, and a
 * font swapping in after this first runs changes every height by however
 * much the fallback face differed. No visible box of its own -- this exists
 * only to set one custom property per role.
 */
export default function WorkStack() {
  useLayoutEffect(() => {
    const heads = Array.from(
      document.querySelectorAll<HTMLElement>("#work [data-role-head]"),
    );
    if (heads.length === 0) return;

    let queued = 0;
    const apply = () => {
      let offset = 0;
      for (const head of heads) {
        head.style.setProperty("--role-stack-offset", `${offset}px`);
        offset += head.getBoundingClientRect().height;
      }
    };
    const debounced = () => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(apply);
    };

    apply();
    const observer = new ResizeObserver(debounced);
    for (const head of heads) observer.observe(head);
    return () => {
      cancelAnimationFrame(queued);
      observer.disconnect();
    };
  }, []);

  return null;
}
