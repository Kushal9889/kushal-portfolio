import { loadContent } from "@/lib/content";

export const dynamic = "force-static";

/**
 * A contact card, generated from the corpus.
 *
 * An address in a web page survives exactly as long as the tab. The realistic
 * path from here to a conversation runs through someone forwarding a thread, a
 * recruiter adding him to a pipeline, or a phone that has to still know who he
 * is in three weeks, and none of those keep a URL. A vCard is the one artifact
 * that leaves the browser and stays in the address book of whoever saved it.
 *
 * Version 3.0 rather than 4.0. It is what iOS Contacts, Google Contacts and
 * Outlook all import without argument; 4.0 is the better spec and the worse
 * choice for a file whose entire job is to be opened by software he does not
 * control.
 *
 * Every field is read from content/facts.md, so this cannot end up holding an
 * address he no longer uses.
 */
export async function GET() {
  const { profile } = loadContent();
  const [first, ...rest] = profile.name.split(" ");

  // CRLF is required by the spec, and the parsers that tolerate bare newlines
  // are not the ones this has to survive.
  const card = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${rest.join(" ")};${first};;;`,
    `FN:${profile.name}`,
    `TITLE:${profile.role}`,
    "ORG:Boston University, Questrom Computational Lab",
    `EMAIL;TYPE=INTERNET,PREF:${profile.email}`,
    `TEL;TYPE=CELL:${profile.phone}`,
    `URL:${profile.site}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${profile.linkedin}`,
    `X-SOCIALPROFILE;TYPE=github:${profile.github}`,
    "ADR;TYPE=WORK:;;;Boston;MA;;USA",
    // The note is what a recruiter reads six weeks later with no memory of the
    // page, so it carries the claim rather than a description of the claim.
    `NOTE:${profile.proof} Available ${profile.available}.`,
    `REV:${new Date(profile.lastVerified).toISOString().replace(/\.\d{3}/, "")}`,
    "END:VCARD",
  ].join("\r\n");

  return new Response(card, {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": 'inline; filename="kushal-gaddamwar.vcf"',
      "cache-control": "public, max-age=3600",
    },
  });
}
