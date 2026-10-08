import type { ReactNode } from "react";
import styles from "../ds.module.css";

export function Section({
  id,
  index,
  title,
  intro,
  children,
}: {
  id: string;
  index: number;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.sectionHead}>
        <p className={`type-eyebrow ${styles.sectionNum}`}>{String(index).padStart(2, "0")}</p>
        <h2 id={`${id}-title`} className={`type-h1 ${styles.sectionTitle}`}>
          {title}
        </h2>
        <p className={`type-body-l ${styles.sectionIntro}`}>{intro}</p>
      </header>
      {children}
    </section>
  );
}

export function Sub({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.sub}>
      <h3 className="type-h2">{title}</h3>
      {children ? <p className={styles.subIntro}>{children}</p> : null}
    </div>
  );
}
