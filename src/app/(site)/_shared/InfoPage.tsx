import { Children, isValidElement, type ReactNode } from "react";
import { BackLink } from "@/components/nav/SiteHeader";
import styles from "./InfoPage.module.css";

interface InfoPageProps {
  eyebrow: string;
  title: string;
  lead: ReactNode;
  /** e.g. "9 October 2026". */
  updated?: string;
  /** Something that must still happen before launch, shown as a plain notice. */
  note?: string;
  children: ReactNode;
}

/** Help and legal pages: one reading column, plain sections. */
export function InfoPage({ eyebrow, title, lead, updated, note, children }: InfoPageProps) {
  const sections = Children.toArray(children).filter(isValidElement<{ title: string }>).filter(child => typeof child.props.title === "string");
  return (
    <main id="main" className={`container ${styles.page}`}>
      <BackLink href="/">Home</BackLink>
      <p className={`type-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
      <h1 className="type-display-l">{title}</h1>
      <p className={`type-body-l ${styles.lead}`}>{lead}</p>
      {updated || note ? (
        <p className={styles.note}>
          {updated ? <>Last updated {updated}. </> : null}
          {note ? <span>{note}.</span> : null}
        </p>
      ) : null}
      <div className={styles.contentGrid}>
        <nav className={styles.contents} aria-label="On this page"><h2>On this page</h2><ol>{sections.map(section => <li key={section.props.title}><a href={`#${sectionId(section.props.title)}`}>{section.props.title}</a></li>)}</ol></nav>
        <div className={styles.body}>{children}</div>
      </div>
    </main>
  );
}

/** A titled section of an info page. */
export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section id={sectionId(title)} className={styles.section}>
      <h2 className="type-h3">{title}</h2>
      {children}
    </section>
  );
}

function sectionId(title: string) { return title.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
