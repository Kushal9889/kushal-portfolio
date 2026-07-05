import { allLinks, loadContent } from "../lib/content";

/**
 * Checks every external link the site renders.
 *
 * A dead link on a portfolio reads as an abandoned site, and reviewers rate that
 * worse than having no site at all. This runs in CI so the failure surfaces on a
 * pull request rather than in front of a recruiter.
 */
async function check(url: string) {
  try {
    // HEAD first; some hosts refuse it, so fall back to a ranged GET rather than
    // reporting a link as broken when it is only unwilling to answer HEAD.
    let res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetch(url, { method: "GET", redirect: "follow", headers: { range: "bytes=0-0" } });
    }
    return { url, status: res.status, ok: res.status < 400 };
  } catch (err) {
    return { url, status: 0, ok: false, error: (err as Error).message };
  }
}

async function main() {
  // The site's own URL is skipped: it 404s until the first deploy, and failing
  // the build that produces the deploy would be a loop with no exit.
  const self = loadContent().profile.site;
  const links = allLinks().filter((url) => !url.startsWith(self));
  const results = await Promise.all(links.map(check));
  const broken = results.filter((r) => !r.ok);

  for (const r of results.sort((a, b) => Number(a.ok) - Number(b.ok))) {
    console.log(`${r.ok ? "ok  " : "FAIL"} ${String(r.status).padStart(3)}  ${r.url}`);
  }

  console.log(`\n${links.length} links, ${broken.length} broken`);
  if (broken.length) process.exit(1);
}

main();
