import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Icon } from "@/components/icon/Icon";
import { Motion } from "./MotionSection";
import {
  ArtDirection,
  Atmosphere,
  Colour,
  Contrast,
  Grid,
  Icons,
  Section,
  Shape,
  Space,
  TokenFiles,
  Typography,
} from "./sections";
import styles from "./ds.module.css";

export const metadata: Metadata = {
  title: "Foundations · Design system",
  description: "DFX design foundations: colour, type, space, radius, elevation, grid and motion tokens.",
};

const sections: { id: string; title: string; intro: string; Content: ComponentType }[] = [
  {
    id: "art-direction",
    title: "Art direction",
    intro:
      "Premium clarity with a playful signal. The airy finance and health screens (images 2–3) carry the interface; the ticket tiles (image 4) add colour in small doses.",
    Content: ArtDirection,
  },
  {
    id: "colour",
    title: "Colour",
    intro:
      "A warm, quiet base with a few confident accents. Components use semantic role names, never raw hex values.",
    Content: Colour,
  },
  {
    id: "contrast",
    title: "Contrast audit",
    intro: "Every text and control colour pairing the system allows, measured against WCAG 2.2 AA.",
    Content: Contrast,
  },
  {
    id: "atmosphere",
    title: "Atmosphere",
    intro:
      "Soft blooms, glass and status tiles add depth to marketing art. They never sit behind anything a person has to read or fill in.",
    Content: Atmosphere,
  },
  {
    id: "typography",
    title: "Typography",
    intro: "Space Grotesk for a few big headlines. Inter for everything people read and fill in.",
    Content: Typography,
  },
  {
    id: "space",
    title: "Space and sizing",
    intro: "A 4px rhythm and generous controls sized for thumbs, not cursors.",
    Content: Space,
  },
  {
    id: "shape",
    title: "Radius, elevation and focus",
    intro: "Soft, consistent corners. Keylines before shadows. A focus ring that is always visible.",
    Content: Shape,
  },
  {
    id: "grid",
    title: "Grid and breakpoints",
    intro:
      "Composition changes with width, not just scale. These widths are reference frames; production CSS responds to the content.",
    Content: Grid,
  },
  {
    id: "motion",
    title: "Motion",
    intro:
      "Soft like images 2–3, crisp like image 4, and always secondary to the task. Try each pattern, then switch on the reduced-motion preview.",
    Content: Motion,
  },
  {
    id: "icons",
    title: "Icons",
    intro: "One outline family in three sizes.",
    Content: Icons,
  },
  {
    id: "tokens",
    title: "Token files",
    intro: "The same tokens, ready for Figma and for code.",
    Content: TokenFiles,
  },
];

const signOff = [
  {
    question: "Primary action colour",
    proposal:
      "Forest #16372C with white text for every primary button. Lime is the accent and selection colour, never a button on light pages.",
  },
  {
    question: "Focus ring",
    proposal: "Blue #415EC8 on light surfaces, lime on forest. A 2px ring with a 2px gap.",
  },
  {
    question: "Progress stepper",
    proposal:
      "Completed stages in forest with a check; the current stage in lime with an ink outline. Lime alone is invisible on white (1.2:1). In narrow spaces the stage names collapse to “Step 2 of 4 · Your situation”.",
  },
  {
    question: "Button radius",
    proposal:
      "16px everywhere. The brief says 18px for the hero CTA (H0.2) but 16px in the radius scale (§12); one value keeps the system consistent.",
  },
  {
    question: "Derived colours",
    proposal:
      "Fourteen extra values for hover, pressed, field borders and feedback text, because the brief’s palette has no accessible versions of these.",
  },
  {
    question: "Typefaces",
    proposal: "Space Grotesk (display) and Inter (UI). Both are free under the Open Font License and cover English well.",
  },
  {
    question: "Glow colours",
    proposal:
      "Saturated pink, green and amber at the brief’s 18–36% opacity. Pastel base colours at that opacity barely show.",
  },
  {
    question: "Eyebrow tracking",
    proposal: "+0.1em, from the §12 type table. H0.2 says +0.12em for the hero eyebrow.",
  },
];

function TocList() {
  return (
    <ol className={styles.tocList}>
      {sections.map(({ id, title }, i) => (
        <li key={id}>
          <a href={`#${id}`}>
            <span className={styles.tocNum}>{String(i + 1).padStart(2, "0")}</span>
            {title}
          </a>
        </li>
      ))}
      <li>
        <a href="#sign-off">
          <span className={styles.tocNum}>{String(sections.length + 1).padStart(2, "0")}</span>
          Sign-off questions
        </a>
      </li>
    </ol>
  );
}

export default function DesignSystemPage() {
  return (
    <>
      <header className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <Link href="/" className={styles.brand}>
            <Wordmark />
            <span className={styles.brandLabel}>Design system</span>
          </Link>
          <p className={styles.status}>
            <span className={styles.statusDot} aria-hidden="true" />
            Part 1 of 6 · Foundations
          </p>
        </div>
      </header>

      <main id="main">
        <section className={styles.hero} aria-labelledby="ds-title">
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroCopy}>
              <p className={`type-eyebrow ${styles.eyebrow}`}>Part 1 · Foundations</p>
              <h1 id="ds-title" className={`type-display-xl ${styles.heroTitle}`}>
                Quiet clarity, with a playful signal.
              </h1>
              <p className={`type-body-l ${styles.heroLead}`}>
                The colour, type, space, shape and motion tokens that every DFX screen is built from: homepage,
                assessment, WhatsApp and email handoff, results and call booking.
              </p>
              <ul className={styles.heroMeta} aria-label="Document status">
                <li>Brief v1.0 §11–§16</li>
                <li>Proposed · awaiting Gate 3 sign-off</li>
                <li>Loan matching · Singapore</li>
              </ul>
            </div>

            <div className={styles.heroArt} aria-hidden="true">
              <span className={`${styles.bloom} ${styles.bloomBlush}`} />
              <span className={`${styles.bloom} ${styles.bloomGreen}`} />
              <span className={`${styles.bloom} ${styles.bloomAmber}`} />
              <div className={styles.artCard}>
                <p className={`type-meta ${styles.muted}`}>color.semantic.action.primary</p>
                <div className={styles.artSwatches}>
                  <span style={{ background: "var(--palette-forest)" }} />
                  <span style={{ background: "var(--palette-lime)" }} />
                  <span style={{ background: "var(--palette-paper)" }} />
                  <span style={{ background: "var(--palette-ink)" }} />
                </div>
                <p className={styles.artCardTitle}>
                  Forest <code>#16372C</code>
                </p>
              </div>
              <div className={`${styles.artTicket} ${styles.notched}`}>
                <span>Selected</span>
                <span className={styles.artCheck}>
                  <Icon name="check" size={20} />
                </span>
              </div>
              <div className={styles.artType}>
                <span className={styles.artGlyph}>Aa</span>
                <span className="type-meta">Space Grotesk · Inter</span>
              </div>
            </div>
          </div>
        </section>

        <div className={`container ${styles.layout}`}>
          <nav className={styles.toc} aria-label="On this page">
            <details className={styles.tocMobile}>
              <summary>
                On this page
                <Icon name="chevron-down" size={20} />
              </summary>
              <TocList />
            </details>
            <div className={styles.tocDesktop}>
              <p className={`type-eyebrow ${styles.muted}`}>On this page</p>
              <TocList />
            </div>
          </nav>

          <div className={styles.content}>
            {sections.map(({ id, title, intro, Content }, i) => (
              <Section key={id} id={id} index={i + 1} title={title} intro={intro}>
                <Content />
              </Section>
            ))}

            <Section
              id="sign-off"
              index={sections.length + 1}
              title="Sign-off questions"
              intro="Where the brief was open or contradicted itself, I made these calls. Confirm or change them before Part 2 (components) builds on them."
            >
              <ol className={styles.signoff}>
                {signOff.map(({ question, proposal }) => (
                  <li key={question}>
                    <h3 className="type-h3">{question}</h3>
                    <p>{proposal}</p>
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className="container">
          <p className="type-meta">
            Built from the DFX Design Brief v1.0 (8 October 2026). Foundations v0.1. Proposed values, pending product
            and brand approval.
          </p>
        </div>
      </footer>
    </>
  );
}
