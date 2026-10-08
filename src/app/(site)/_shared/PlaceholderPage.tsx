import type { ReactNode } from "react";
import { BackLink } from "@/components/nav/SiteHeader";
import { Placeholder } from "@/components/placeholder/Placeholder";
import styles from "./PlaceholderPage.module.css";

/** A real destination for every link, until the approved page exists. */
export function PlaceholderPage({ eyebrow, title, note, children }: { eyebrow: string; title: string; note: string; children: ReactNode }) {
  return (
    <main id="main" className={`container ${styles.page}`}>
      <BackLink href="/">Home</BackLink>
      <p className={`type-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
      <h1 className="type-display-l">{title}</h1>
      <div className={styles.body}>{children}</div>
      <p className={styles.note}>
        <Placeholder note={note}>This page is a placeholder.</Placeholder>
      </p>
    </main>
  );
}
