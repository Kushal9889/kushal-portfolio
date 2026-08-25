import Hero from "./components/Hero";
import Prose from "./components/Prose";
import Certifications from "./components/Certifications";
import DiffReveal from "./components/DiffReveal";
import Agent from "./components/Agent";
import Palette from "./components/Palette";
import LiveStatus from "./components/LiveStatus";
import Metrics from "./components/Metrics";
import RetrievalField from "./components/RetrievalField";
import Artifacts from "./components/Artifacts";
import Measured from "./components/Measured";
import Reach from "./components/Reach";
import ReachDock from "./components/ReachDock";
import SectionLink from "./components/SectionLink";
import PageMotion from "./components/PageMotion";
import AskSeeds from "./components/AskSeeds";
import Topology from "./components/Topology";
import OverlapGraph from "./components/OverlapGraph";
import ModelChoice from "./components/ModelChoice";
import Defects from "./components/Defects";
import WorkStack from "./components/WorkStack";
import EvalMatrix from "./components/EvalMatrix";
import Artifacts2 from "./components/Artifacts";
import evals from "@/content/evals.json";
import { loadContent, section, loadCertifications, type Section } from "@/lib/content";
import styles from "./page.module.css";

function Section({
  id,
  index,
  title,
  children,
  ...tone
}: {
  id: string;
  index: string;
  title: string;
  children: React.ReactNode;
  /** Per-section treatment. Five identical sections read as one document. */
  "data-tone"?: "sunk";
  "data-weight"?: "closing";
  "data-lead"?: "artifact";
}) {
  return (
    <section id={id} className={styles.section} {...tone}>
      {/* Two columns above 62rem: the heading holds a rail on the left and
          everything else runs beside it. Stacked, seven section headings cost
          most of a screen on their own and the page used half its width. The
          children stay direct descendants of the wrap so the scroll batching
          still sees them individually. */}
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.head}>
          {/* The index was decoration, then an anchor. An anchor still asks a
              reader to know that right-clicking copies an address; the commonest
              reason to want one of these is to paste it into a message. */}
          <SectionLink id={id} index={index} title={title} />
          <h2 className={styles.title}>{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

/**
 * Title, employer, dates -- the part of a role a recruiter scans for first.
 *
 * The title leads. It is set largest; the employer and dates sit under it as
 * context. Rendering the company first put the least scannable line in the
 * most prominent position.
 */
function roleIdentity(s: Section) {
  const { title, dates, location } = s.roleParts;
  return (
    <>
      <h3 className={styles.roleName}>{title}</h3>
      <p className={styles.roleMeta}>
        <span className={styles.company}>{s.title}</span>
        <span className="label">
          {dates}
          {location ? ` · ${location}` : ""}
        </span>
      </p>
    </>
  );
}

/**
 * The identity, rendered into the rail column on a desktop-width screen --
 * one sibling per role, deliberately not nested inside that role's own
 * content. See the comment on .roleRail in page.module.css for why the
 * identity has to live in a column shared by every role rather than inside
 * each role's own box: it is what lets every role's title stay visible and
 * stack as the reader scrolls, instead of swapping out for the next one.
 * Hidden below 62rem -- RoleContent carries its own copy of this for that
 * width instead, because there the reason to keep it separate (a shared tall
 * containing block for sticky positioning) does not apply.
 */
function RoleHead({ section: s, past = false }: { section: Section; past?: boolean }) {
  return (
    <div className={styles.roleHead} data-role-head data-past={past || undefined}>
      {roleIdentity(s)}
    </div>
  );
}

/**
 * A role's evidence: metrics, follow-ups, stack, and the description.
 *
 * Two-year-old work is context, not evidence, and rendering it identically to
 * the current role spends the same amount of the reader's attention on both.
 * The content is unchanged; only its weight is.
 */
function RoleContent({ section: s, past = false }: { section: Section; past?: boolean }) {
  return (
    <article className={styles.roleContent} data-past={past || undefined}>
      <div className={styles.roleHeadMobile}>{roleIdentity(s)}</div>
      <Metrics items={s.metrics} />
      {s.asks.length > 0 && <AskSeeds items={s.asks} />}
      {s.stack.length > 0 && (
        <ul className={styles.stack}>
          {s.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      <Prose body={s.body} className={styles.roleBody} />
    </article>
  );
}

export default function Page() {
  const { profile } = loadContent();
  const certs = loadCertifications();
  const asks = loadContent().sections.flatMap((x) => x.asks.map((a) => a.question));

  /**
   * The hero's one piece of outside validation, assembled from the corpus.
   *
   * Figure, unit and link all come from the open-source section rather than
   * being typed here: the metric is the same `57 hours` the section renders,
   * and the link is the same merged pull request the link checker resolves. A
   * second copy of any of it is a second thing that can drift.
   */
  const os = section("Open source, LangChain deepagents");
  const hours = os.metrics.find((m) => /hour/i.test(m.value));
  const merged = os.artifacts.find((a) => a.state === "merged");
  const evidence = {
    figure: hours?.value.replace(/\s*hours?$/i, "") ?? "57",
    unit: "hours to merge",
    sentence: profile.proof,
    href: merged?.url ?? profile.github,
    label: merged?.label ?? "",
  };
  const featured = certs.find((c) => c.featured);

  // Computed once, read by both RoleHead and RoleContent, so the rail and the
  // content column render from the same object rather than each parsing the
  // corpus a second time.
  const questrom = section("Boston University, Questrom Computational Lab");
  const img = section("IMG Systems");
  const growaza = section("Growaza");

  return (
    <>
      <Palette email={profile.email} github={profile.github} repo={profile.repo} asks={asks} />
      {/* Reaching him from wherever the reader is, with the draft written for
          the section they are actually in. Six of the seven openers in
          lib/reach.ts have never been reachable, because the contact block is
          the only caller and it takes the default. */}
      <ReachDock
        email={profile.email}
        site={profile.site.replace("https://", "")}
        linkedin={profile.linkedin}
        resumeHref="/kushal-gaddamwar-resume.pdf"
      />
      <PageMotion />
      {/* Scroll progress. Purely decorative, so it is hidden from assistive tech
          and disappears entirely under reduced-motion. */}
      <div className={styles.progress} aria-hidden="true" />
      <Hero
        name={profile.name}
        tagline={profile.tagline}
        location={profile.location}
        current={profile.current}
        focus={profile.focus}
        evidence={evidence}
        available={profile.available}
        credential={{
          label: featured ? `${featured.issuer} Certified · ${featured.short ?? featured.name}` : "",
          url: featured?.url ?? "#",
        }}
        contactHref="#contact"
      >
        <Agent email={profile.email} linkedin={profile.linkedin} />
      </Hero>

      <main id="main">
        <Section id="opensource" index="01" title="A bug in LangChain" data-lead="artifact">
          {/* The duration and the pull request come from the corpus, not from
              inside the component: the same three values are rendered by the
              metrics strip and the artifact rows on this very section. */}
          <DiffReveal
            hours={os.metrics.find((m) => /hour/i.test(m.value))?.value ?? ""}
            prUrl={merged?.url ?? ""}
            prLabel={merged?.label.replace(/^.*#/, "PR #") ?? ""}
          />
          <Metrics items={section("Open source, LangChain deepagents").metrics} />
          <Prose body={section("Open source, LangChain deepagents").body} />
          <Artifacts items={section("Open source, LangChain deepagents").artifacts} />
          <AskSeeds items={section("Open source, LangChain deepagents").asks} />
        </Section>

        {/* The strongest signal in 2026 hiring is evidence that the thing was
            measured, not that it was built. It sits second because the bug above
            proves he finds failures and this proves he checks for them. */}
        <Section id="measured" index="02" title="How this is measured">
          <Measured />
          {/* The suite as sixteen objects rather than one ratio. Six of them are
              attempts to break the agent, which the score cannot say. */}
          <EvalMatrix />
          {/* Which model answers, and the measurement that says the choice was
              not a guess. Beside the eval matrix because both are published
              results from a build-time run rather than something happening now. */}
          <ModelChoice />
          <Defects />
        </Section>

        {/* What he is and what he is not, before the evidence. A reader who has
            just watched the agent answer wants to know who they are talking to;
            the scope limits are here rather than buried because stating them
            early is what makes the rest of the page readable as fact. */}
        <Section id="approach" index="03" title="How he works">
          {/* The retriever drawing its own last run. Ranks are exact, so ranks
              are what is plotted; the 3D projection that was tried first is
              reported as failed inside the figure rather than quietly dropped. */}
          {/* The shape of the thing, before the figure showing one run of it.
              The page has claimed conditional routing since it was built and the
              only evidence was a drawing in a comment. */}
          <Topology />
          <RetrievalField />
          {/* Built on every deploy by scripts/build-graph.ts and imported by
              nothing until now. It is the only figure here that shows the work
              as connected rather than as a list. */}
          <OverlapGraph />
          <Prose body={section("Who he is").body} />
          <Prose body={section("What he is good at").body} />
          {/* Condensed mode keeps only the first paragraph of a prose block,
              which took two thirds of the scope limits with it. This is the one
              section whose whole value is that it narrows the claim. */}
          <div data-keep="all">
            <Prose body={section("What he does not do").body} />
          </div>
        </Section>

        <Section id="work" index="04" title="Work">
          <WorkStack />
          {/* Rail and content are two columns of one grid, not three
              self-contained role cards, so every role's identity can share
              one tall containing block and stack rather than take turns --
              see .roleRail in page.module.css. */}
          <div className={styles.roles}>
            <div className={styles.roleRail}>
              <RoleHead section={questrom} />
              <RoleHead section={img} past />
              <RoleHead section={growaza} past />
            </div>
            <div className={styles.roleContentCol}>
              <RoleContent section={questrom} />
              <RoleContent section={img} past />
              <RoleContent section={growaza} past />
            </div>
          </div>
        </Section>

        {/* Research took this section from BU Life AI.
            The paper is first-author work with measured numbers and a DOI, and
            it sat in a one-third column under Credentials while a side project
            held a top-level heading. It also completes the thread section 01
            opens: the paper argues context is needed to catch bugs static
            analysis misses, and the LangChain defect was exactly that shape. */}
        <Section id="research" index="05" title="Research">
          <Metrics items={section("Publications").metrics} />
          <Prose body={section("Publications").body} />
          {/* Both papers as rows a reader can open, rather than as two links
              inside a paragraph. The DOI resolves; the link checker proves it. */}
          <Artifacts2 items={section("Publications").artifacts} />
        </Section>


        <Section id="proof" index="06" title="Credentials" data-tone="sunk">
          <Certifications certifications={certs} />
          {/* Demoted from its own section. Still live, still measured, and no
              longer occupying a top-level heading it did not earn. */}
          <div className={styles.alsoBuilt}>
            <h3 className={styles.subhead}>Also running</h3>
            <LiveStatus url="https://bulife-ai.netlify.app/" label="bulife-ai.netlify.app" />
            {/* Its three metrics and eight-item stack were parsed out of the
                body by the corpus loader and rendered nowhere, so the section
                shipped as prose with the numbers stripped out of it. Demoted is
                not the same as gutted. */}
            <Metrics items={section("BU Life AI").metrics} />
            <Prose body={section("BU Life AI").body} />
            <ul className={styles.stack}>
              {section("BU Life AI").stack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className={styles.split}>
            <div>
              <h3 className={styles.subhead}>Education</h3>
              <Prose body={section("Education").body} />
            </div>
            <div>
              <h3 className={styles.subhead}>Before this</h3>
              <Metrics items={section("Achievements").metrics} />
              <Prose body={section("Achievements").body} />
            </div>
          </div>
        </Section>


        <Section id="contact" index="07" title="Get in touch" data-weight="closing">
          <Prose body={section("Availability").body} />
          {/* Every path from "decided to write" to "message sent", with the
              draft already composed. The bare mailto that was here opened an
              empty window at the exact moment the reader had chosen to act. */}
          <Reach
            email={profile.email}
            phone={profile.phone}
            linkedin={profile.linkedin}
            github={profile.github}
            repo={profile.repo}
            site={profile.site.replace("https://", "")}
            resumeHref="/kushal-gaddamwar-resume.pdf"
            forward={{
              name: profile.name,
              current: profile.current,
              proof: profile.proof,
              site: profile.site,
              evals,
            }}
          />
        </Section>
      </main>

      <footer className={styles.footer}>
        <div className="wrap">
          <Prose body={section("This site").body} className={styles.footerNote} />
          <p className="label">Last verified {profile.lastVerified}</p>
        </div>
      </footer>
    </>
  );
}
