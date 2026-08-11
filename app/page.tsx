import Hero from "./components/Hero";
import Prose from "./components/Prose";
import Certifications from "./components/Certifications";
import DiffReveal from "./components/DiffReveal";
import Agent from "./components/Agent";
import Palette from "./components/Palette";
import LiveStatus from "./components/LiveStatus";
import Metrics from "./components/Metrics";
import CorpusGraph from "./components/CorpusGraph";
import CorpusMatrix from "./components/CorpusMatrix";
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
      <div className="wrap">
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
function Role({
  role,
  company,
  dates,
  section: s,
}: {
  role: string;
  company: string;
  dates: string;
  section: Section;
}) {
  return (
    <article className={styles.role}>
      <div className={styles.roleHead}>
        <h3 className={styles.roleName}>{role}</h3>
        <p className={styles.roleMeta}>
          <span className={styles.company}>{company}</span>
          <span className="label">{dates}</span>
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
      <Prose body={s.body} className={styles.roleBody} />
    </article>
  );
}

export default function Page() {
  const { profile } = loadContent();
  const certs = loadCertifications();
  const featured = certs.find((c) => c.featured);

  return (
    <>
      <Palette email={profile.email} resume={profile.github} />
      {/* Scroll progress. Purely decorative, so it is hidden from assistive tech
          and disappears entirely under reduced-motion. */}
      <div className={styles.progress} aria-hidden="true" />
      <Hero
        name={profile.name}
        tagline={profile.tagline}
        location={profile.location}
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
        </Section>

        {/* What he is and what he is not, before the evidence. A reader who has
            just watched the agent answer wants to know who they are talking to;
            the scope limits are here rather than buried because stating them
            early is what makes the rest of the page readable as fact. */}
        <Section id="approach" index="02" title="How he works">
          <CorpusGraph />
          <CorpusMatrix />
          <Prose body={section("Who he is").body} />
          <Prose body={section("What he is good at").body} />
          <Prose body={section("What he does not do").body} />
        </Section>

        <Section id="work" index="03" title="Work">
          <Role
            role="AI Engineer, Graduate Researcher"
            company="Boston University, Questrom Computational Lab"
            dates="May 2026 to present"
            section={section("Boston University, Questrom Computational Lab")}
          />
          <Role
            role="Software Engineering Intern"
            company="IMG Systems"
            dates="Aug 2024 to Apr 2025"
            section={section("IMG Systems")}
          />
          <Role
            role="Associate Software Engineer Intern"
            company="Growaza"
            dates="Jan 2024 to Jul 2024"
            section={section("Growaza")}
          />
        </Section>

        <Section id="projects" index="04" title="BU Life AI">
          <LiveStatus url="https://bulife-ai.netlify.app/" label="bulife-ai.netlify.app" />
          <Metrics items={section("BU Life AI").metrics} />
          <Prose body={section("BU Life AI").body} />
        </Section>

        <Section id="proof" index="05" title="Proof" data-tone="sunk">
          <Certifications certifications={certs} />
          <div className={styles.split}>
            <div>
              <h3 className={styles.subhead}>Publications</h3>
              <Prose body={section("Publications").body} />
            </div>
            <div>
              <h3 className={styles.subhead}>Before this</h3>
              <Prose body={section("Achievements").body} />
            </div>
          </div>
        </Section>


        <Section id="contact" index="06" title="Get in touch" data-weight="closing">
          <Prose body={section("Availability").body} />
          {/* Marks sit before the label so the eye lands on a recognisable shape
              first. They inherit text colour, so the one-accent rule holds. */}
          <ul className={styles.links}>
            <li>
              <a href={`mailto:${profile.email}`}>
                <MailMark />
                {profile.email}
              </a>
            </li>
            <li>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <LinkedInMark />
                LinkedIn
              </a>
            </li>
            <li>
              <a href={profile.github} target="_blank" rel="noreferrer">
                <GitHubMark />
                GitHub
              </a>
            </li>
          </ul>
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
