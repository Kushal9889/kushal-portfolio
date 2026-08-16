"use client";

import { useMotion } from "@/lib/motion";

/**
 * Section entrances, once the motion bundle is here.
 *
 * The stylesheet already does this on its own scroll timelines, and keeps doing
 * it in Safari and with scripting off. This takes over where it can, for one
 * reason: a CSS view() timeline ties progress to scroll position, so scrubbing
 * back up runs the entrance backwards and the page appears to undo itself. A
 * trigger that fires once does not.
 *
 * Nothing is ever hidden and then revealed. The tween is a from(), so an element
 * is only ever animated out of a state it is already leaving: if this file never
 * loads, or loads and throws, every word is exactly where it was. An earlier
 * version pre-hid the elements it judged to be below the fold and measured the
 * viewport to decide which those were, which made the entrance depend on the
 * exact millisecond the idle callback happened to fire. It fired before layout
 * had settled, measured nothing below the fold, and silently did nothing at all.
 *
 * Whatever is already on screen when this arms is left alone. ScrollTrigger
 * reports those as entering the moment it initialises, and animating them would
 * mean fading out text the visitor is in the middle of reading, so enters are
 * ignored until after the first frame.
 */
export default function SectionMotion() {
  const ref = useMotion<HTMLDivElement>(({ gsap, ScrollTrigger }) => {
    // Queried off the document rather than passed as selector text. The setup
    // runs inside a gsap context whose scope is the mounted element below, and a
    // context rewrites every selector string inside it to search within that
    // scope: as a string this matched nothing, silently, because the scope is an
    // empty node. The context is still what cleans these tweens up.
    const items = Array.from(
      document.querySelectorAll<HTMLElement>("main > section > .wrap > *"),
    );
    if (items.length === 0) return;

    let armed = false;

    // Batching collapses what would be one ScrollTrigger per element into a
    // handful, and groups anything crossing the line in the same frame into a
    // single staggered tween, so a dense section arrives as one movement rather
    // than as twelve unrelated ones.
    ScrollTrigger.batch(items, {
      start: "top 88%",
      once: true,
      onEnter: (batch) => {
        if (!armed) return;
        gsap.from(batch, {
          opacity: 0,
          y: 14,
          duration: 0.5,
          stagger: 0.06,
          overwrite: true,
        });
      },
    });

    requestAnimationFrame(() => {
      armed = true;
    });
  });

  // No box, no space, no accessibility surface. This exists only to give the
  // hook something mounted to hang a lifetime on.
  return <div ref={ref} hidden />;
}
