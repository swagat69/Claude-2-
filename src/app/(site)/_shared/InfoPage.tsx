import type { ReactNode } from "react";
import { BackLink } from "@/components/nav/SiteHeader";
import { Placeholder } from "@/components/placeholder/Placeholder";
import styles from "./InfoPage.module.css";

interface InfoPageProps {
  eyebrow: string;
  title: string;
  lead: ReactNode;
  /** e.g. "9 October 2026". */
  updated?: string;
  /** Something that must still happen before launch, shown as a Placeholder tag. */
  note?: string;
  children: ReactNode;
}

/** Help and legal pages: one reading column, plain sections. */
export function InfoPage({ eyebrow, title, lead, updated, note, children }: InfoPageProps) {
  return (
    <main id="main" className={`container ${styles.page}`}>
      <BackLink href="/">Home</BackLink>
      <p className={`type-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
      <h1 className="type-display-l">{title}</h1>
      <p className={`type-body-l ${styles.lead}`}>{lead}</p>
      {updated || note ? (
        <p className={styles.note}>
          {updated ? <>Last updated {updated}. </> : null}
          {note ? <Placeholder note={note}>{note}.</Placeholder> : null}
        </p>
      ) : null}
      <div className={styles.body}>{children}</div>
    </main>
  );
}

/** A titled section of an info page. */
export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className="type-h3">{title}</h2>
      {children}
    </section>
  );
}
