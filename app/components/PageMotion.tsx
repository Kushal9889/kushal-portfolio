"use client";

import { useMotion } from "@/lib/motion";

/**
 * Everything the page animates that does not belong to one component.
 *
 * Three behaviours, one mounted node, one lifetime. Splitting them into separate
 * components would mean three hidden elements and three copies of the same
 * arming logic for no gain, since they all want the same thing: run after first
 * paint, never before, and never at all under reduced motion.
 *
 * Nothing here is ever hidden and then revealed. Every tween is a from(), so an
 * element is only animated out of a state it is already leaving. If this file
 * fails to load, or throws, the page is exactly what the HTML said it was.
 *
 * Anything already on screen when this arms is left alone. ScrollTrigger reports
 * those as entering the moment it initialises, and animating them would mean
 * pulling text out from under someone mid-sentence, so enters are ignored until
 * after the first frame.
 */
export default function PageMotion() {
  const ref = useMotion<HTMLDivElement>(({ gsap, ScrollTrigger, SplitText }) => {
    let armed = false;
    requestAnimationFrame(() => {
      armed = true;
    });

    /**
     * Which elements have had their entrance.
     *
     * This is deliberately not ScrollTrigger's own `once`, which kills the
     * trigger the first time it reports an enter. Triggers also report an enter
     * during the layout pass that follows webfonts landing, and at that moment
     * nothing is armed yet, so `once` was quietly spending every entrance on a
     * frame no visitor was looking at. The heading reveals were being destroyed
     * before anyone scrolled to them, which is why they never played.
     */
    const played = new WeakSet<Element>();
    const first = (el: Element) => {
      if (!armed || played.has(el)) return false;
      played.add(el);
      return true;
    };

    /* --- Headings rise out of their own bounding box ------------------------
     *
     * Split into lines and masked, so each line is revealed by its own overflow
     * edge rather than by fading. It reads as typesetting rather than as an
     * animation, and it is markedly less worn than the per-character reveal that
     * every award-site hero has used for the last two years.
     *
     * The h1 is deliberately not in this set. It is the largest element in the
     * viewport on load, which makes it the element the browser measures for
     * Largest Contentful Paint, and a heading that arrives late is a heading
     * that reports late.
     */
    const headings = Array.from(document.querySelectorAll<HTMLElement>("main section h2"));

    for (const heading of headings) {
      const split = new SplitText(heading, { type: "lines", mask: "lines" });

      ScrollTrigger.create({
        trigger: heading,
        start: "top 88%",
        onEnter: () => {
          if (!first(heading)) return;
          gsap.from(split.lines, {
            yPercent: 115,
            duration: 0.7,
            stagger: 0.07,
            ease: "power3.out",
          });
        },
      });
    }

    /* --- Section bodies settle in ------------------------------------------
     *
     * Batching collapses what would be one trigger per element into a handful,
     * and groups anything crossing the line in the same frame into a single
     * staggered tween, so a dense section arrives as one movement rather than as
     * twelve unrelated ones.
     *
     * Blocks containing a heading are skipped: those are handled above, and
     * running both would fade a heading in while its own lines were still
     * rising through it.
     */
    const blocks = Array.from(
      document.querySelectorAll<HTMLElement>("main > section > .wrap > *"),
    ).filter((el) => !el.querySelector("h2"));

    if (blocks.length > 0) {
      ScrollTrigger.batch(blocks, {
        start: "top 88%",
        onEnter: (batch) => {
          const fresh = batch.filter(first);
          if (fresh.length === 0) return;
          gsap.from(fresh, {
            opacity: 0,
            y: 14,
            duration: 0.5,
            stagger: 0.06,
            overwrite: true,
          });
        },
      });
    }

    /* --- The things worth clicking lean toward the cursor -------------------
     *
     * Only the handful of elements marked in the markup, because the effect
     * works by being rare: if every link did it, none of them would read as
     * worth reaching for.
     *
     * Guarded on a real pointer. On a touch screen the browser synthesises a
     * pointer at the tap position, which would jerk the control sideways at the
     * exact moment a finger is trying to land on it.
     */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-pull]"))) {
      // quickTo reuses one tween per property instead of allocating a new one on
      // every pointermove, which is what makes this affordable at pointer rate.
      const toX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const toY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

      el.addEventListener("pointermove", (event) => {
        const box = el.getBoundingClientRect();
        // Vertical pull is stronger than horizontal because these controls are
        // wider than they are tall, and an equal ratio reads as loose sideways.
        toX((event.clientX - (box.left + box.width / 2)) * 0.16);
        toY((event.clientY - (box.top + box.height / 2)) * 0.3);
      });

      el.addEventListener("pointerleave", () => {
        toX(0);
        toY(0);
      });
    }
  });

  // No box, no space, no accessibility surface. This exists only to give the
  // hook something mounted to hang a lifetime on.
  return <div ref={ref} hidden />;
}
