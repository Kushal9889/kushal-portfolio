# Five things left, with the commands

Everything else is live at https://kushal-portfolio-223.netlify.app.
These five need an account or a decision that a coding session cannot supply.
Roughly ten minutes end to end.

---

## 1. Rotate the NVIDIA key

The current key was pasted into a chat transcript and is set on two public
Netlify sites. Guards bound a single abuser to 200,000 tokens a day, but the
budget is tracked per IP, so someone rotating addresses is not capped.

1. New key at https://build.nvidia.com, revoke the old one
2. Then:

```bash
cd "/Users/kushalgaddamwar/vs_code/Claude/kushal-portfolio/v2"
netlify link --id 5a02ef1d-75c0-4f11-a6af-b4fe2df63e73
netlify env:set NVIDIA_API_KEY "nvapi-NEWKEY" --context production
netlify deploy --prod --build
```

Repeat for the second site, id `df5d64aa-af20-491e-b01d-766f6c172c41`, or delete
that project if one URL is enough. Update `.env.local` too, or the local tests
will run against a revoked key.

**Verify** the deploy actually shipped rather than trusting the exit code:

```bash
curl -s -N "https://kushal-portfolio-223.netlify.app/api/agent/stream?q=What%20did%20he%20build%20at%20IMG%20Systems%3F" | grep '"done"'
```

Expect a `usage` object with non-zero counts.

---

## 2 and 3. ORCID and the site link on GitHub

Both live at https://github.com/settings/profile and need the `user` OAuth
scope, which the CLI token here does not carry. Verified, not assumed: the API
returns 404 with a scope hint.

- **Website**: `https://kushal-portfolio-223.netlify.app`. Currently empty, so
  nothing on the profile links out.
- **ORCID iD**: `0009-0009-9318-1616`. Connecting it makes GitHub render a
  *verified* researcher identity, which almost nobody in the template population
  has. This is the single strongest academic signal available on the profile.

While editing, the bio still contains a literal `\r\n`.

**Verify**

```bash
gh api users/Kushal9889 --jq '{blog, bio}'
```

---

## 4. Add the IEEE paper to ORCID

The record at https://orcid.org/0009-0009-9318-1616 lists only the IGI Global
chapter. The first-author IEEE paper is missing, which leaves the verified record
incomplete on the stronger of the two publications.

Add Works, search by DOI `10.1109/ICAICCIT64383.2024.10912101`.

**Verify**

```bash
curl -s -H "Accept: application/json" \
  "https://pub.orcid.org/v3.0/0009-0009-9318-1616/works" \
  | python3 -c "import sys,json;[print(' -',w['work-summary'][0]['title']['title']['value'][:70]) for w in json.load(sys.stdin)['group']]"
```

Expect two entries.

---

## 5. Decide what happens to the old repo

`Kushal9889/kushal-portfolio` still holds the previous portfolio and its history
back to May. A force-push over it was approved, then blocked by the permission
classifier, so v2 went to a new repo instead and was deployed to the résumé URL.
Nothing was destroyed and the decision is still open.

**Keep both.** The old repo stays as evidence of work going back months. Costs
nothing. This is the default if you do nothing.

**Or force-push and consolidate:**

```bash
cd "/Users/kushalgaddamwar/vs_code/Claude/kushal-portfolio/v2"
git remote add old https://github.com/Kushal9889/kushal-portfolio
git push --force old main
```

That permanently discards the May history. The only copy afterwards is
`~/kushal-portfolio-old-history-20260810.bundle`, restorable with
`git clone <bundle>`. Move it somewhere real before running this.

---

## Then delete this file

```bash
git rm HANDOFF.md && git commit -m "Handoff done"
```
