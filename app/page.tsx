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
import AskAbout from "./components/AskAbout";
import PageMotion from "./components/PageMotion";
import { GitHubMark, LinkedInMark, MailMark } from "./components/Mark";
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
          <span className={styles.index}>{index}</span>
          <h2 className={styles.title}>{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

/**
 * A role, led by the job title.
 *
 * The title is what a recruiter scans for, so it is set largest; the employer
 * and dates sit under it as context. Rendering the company first put the least
 * scannable line in the most prominent position.
 */
function Role({ section: s }: { section: Section }) {
  const { title, dates, location } = s.roleParts;
  return (
    <article className={styles.role}>
      <div className={styles.roleHead}>
        <h3 className={styles.roleName}>{title}</h3>
        <p className={styles.roleMeta}>
          <span className={styles.company}>{s.title}</span>
          <span className="label">
            {dates}
            {location ? ` · ${location}` : ""}
          </span>
        </p>
      </div>
      <Metrics items={s.metrics} />
      {s.stack.length > 0 && (
        <ul className={styles.stack}>
          {s.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      <Prose body={s.body} className={styles.roleBody} fold="always" />
    </article>
  );
}

export default function Page() {
  const { profile } = loadContent();
  const certs = loadCertifications();
  const featured = certs.find((c) => c.featured);

  return (
    <>
      <Palette email={profile.email} github={profile.github} repo={profile.repo} />
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
        proof={profile.proof}
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
          <DiffReveal />
          <Metrics items={section("Open source, LangChain deepagents").metrics} />
          <Prose body={section("Open source, LangChain deepagents").body} />
          <Artifacts items={section("Open source, LangChain deepagents").artifacts} />
          <AskAbout
            email={profile.email}
            site={profile.site.replace("https://", "")}
            context="opensource"
            label="Email him about this bug"
          />
        </Section>

        {/* The strongest signal in 2026 hiring is evidence that the thing was
            measured, not that it was built. It sits second because the bug above
            proves he finds failures and this proves he checks for them. */}
        <Section id="measured" index="02" title="How this is measured">
          <Measured />
          <AskAbout
            email={profile.email}
            site={profile.site.replace("https://", "")}
            context="measured"
            label="Email him about the eval suite"
          />
        </Section>

        {/* What he is and what he is not, before the evidence. A reader who has
            just watched the agent answer wants to know who they are talking to;
            the scope limits are here rather than buried because stating them
            early is what makes the rest of the page readable as fact. */}
        <Section id="approach" index="03" title="How he works">
          {/* The retriever drawing its own last run. Ranks are exact, so ranks
              are what is plotted; the 3D projection that was tried first is
              reported as failed inside the figure rather than quietly dropped. */}
          <RetrievalField />
          <Prose body={section("Who he is").body} />
          <Prose body={section("What he is good at").body} />
          <Prose body={section("What he does not do").body} />
          <AskAbout
            email={profile.email}
            site={profile.site.replace("https://", "")}
            context="approach"
            label="Email him about the retrieval design"
          />
        </Section>

        <Section id="work" index="04" title="Work">
          <Role section={section("Boston University, Questrom Computational Lab")} />
          <Role section={section("IMG Systems")} />
          <Role section={section("Growaza")} />
          <AskAbout
            email={profile.email}
            site={profile.site.replace("https://", "")}
            context="work"
            label="Email him about this work"
          />
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
          <AskAbout
            email={profile.email}
            site={profile.site.replace("https://", "")}
            context="projects"
            label="Email him about the paper"
          />
        </Section>


        <Section id="proof" index="06" title="Credentials" data-tone="sunk">
          <Certifications certifications={certs} />
          {/* Demoted from its own section. Still live, still measured, and no
              longer occupying a top-level heading it did not earn. */}
          <div className={styles.alsoBuilt}>
            <h3 className={styles.subhead}>Also running</h3>
            <LiveStatus url="https://bulife-ai.netlify.app/" label="bulife-ai.netlify.app" />
            <Prose body={section("BU Life AI").body} fold="always" />
          </div>
          <div className={styles.split}>
            <div>
              <h3 className={styles.subhead}>Publications</h3>
              <Prose body={section("Publications").body} />
            </div>
            <div>
              <h3 className={styles.subhead}>Education</h3>
              <Prose body={section("Education").body} />
            </div>
            <div>
              <h3 className={styles.subhead}>Before this</h3>
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
