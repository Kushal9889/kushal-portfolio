"""Capture the page at real viewports and report what lands above the fold.

The in-app browser pane in this environment returns blank frames whenever it is
hidden, which made every screenshot below the hero useless and left the redesign
being verified through getComputedStyle alone. This drives headless Chromium
instead, so a change can actually be looked at.

    python3 scripts/shoot.py                    desktop + mobile, light
    python3 scripts/shoot.py --dark             both, dark
    python3 scripts/shoot.py --at 0 900 1800    extra scroll offsets, desktop
    python3 scripts/shoot.py --url http://localhost:3001/#work

Writes PNGs to /tmp/shots and prints the above-fold inventory, which is the
number that actually decides whether a recruiter sees a thing or not.
"""

import argparse
import json
import os
import sys

from playwright.sync_api import sync_playwright

OUT = "/tmp/shots"

VIEWPORTS = {
    "desktop": (1440, 900),
    "mobile": (390, 844),
}

# Reports every block-level box with real text, its offset, and whether it fell
# inside the first screen. Leaf-ish only, so a wrapper does not hide its
# children behind one row.
INVENTORY = """() => {
  const fold = window.innerHeight;
  const out = [];
  const walk = (el) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      const txt = (c.textContent || '').trim().replace(/\\s+/g, ' ');
      if (r.height > 4 && (c.children.length === 0 || txt.length < 120)) {
        out.push({
          y: Math.round(r.top + window.scrollY),
          h: Math.round(r.height),
          x: Math.round(r.left),
          w: Math.round(r.width),
          cls: (typeof c.className === 'string' ? c.className : '').split(' ')[0].split('__').pop() || c.tagName.toLowerCase(),
          txt: txt.slice(0, 44),
        });
      } else if (c.children.length) walk(c);
    }
  };
  walk(document.body);
  return { fold, docHeight: document.documentElement.scrollHeight, rows: out };
}"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://localhost:3001/")
    ap.add_argument("--dark", action="store_true")
    ap.add_argument("--at", nargs="*", type=int, default=None,
                    help="scroll offsets to capture, desktop only")
    ap.add_argument("--tag", default="", help="suffix for filenames")
    args = ap.parse_args()

    os.makedirs(OUT, exist_ok=True)
    scheme = "dark" if args.dark else "light"
    tag = f"-{args.tag}" if args.tag else ""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for name, (w, h) in VIEWPORTS.items():
            page = browser.new_page(viewport={"width": w, "height": h},
                                    color_scheme=scheme,
                                    device_scale_factor=2)
            page.goto(args.url)
            page.wait_for_load_state("networkidle")
            # The hero runs a live request on mount; give it room to settle so
            # the graph and the telemetry strip are captured with real numbers.
            page.wait_for_timeout(4000)

            page.screenshot(path=f"{OUT}/{name}{tag}-{scheme}.png")

            if name == "desktop":
                data = page.evaluate(INVENTORY)
                above = [r for r in data["rows"] if r["y"] < data["fold"]]
                print(f"\n=== {name} {w}x{h} {scheme} ===")
                print(f"document {data['docHeight']}px, fold {data['fold']}px, "
                      f"{len(above)} blocks above the fold")
                for r in above:
                    print(f"  y{r['y']:>5} x{r['x']:>4} {r['w']:>4}w {r['h']:>3}h  "
                          f"{r['cls'][:22]:<22} {r['txt']}")
                with open(f"{OUT}/inventory{tag}-{scheme}.json", "w") as fh:
                    json.dump(data, fh, indent=1)

                for y in (args.at or []):
                    page.evaluate(f"window.scrollTo(0, {y})")
                    page.wait_for_timeout(700)
                    page.screenshot(path=f"{OUT}/{name}{tag}-{scheme}-y{y}.png")

            page.close()
        browser.close()

    print(f"\nwrote {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
