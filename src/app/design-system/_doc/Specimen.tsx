import type { ReactNode } from "react";
import { Icon } from "@/components/icon/Icon";
import ds from "../ds.module.css";
import styles from "./specimen.module.css";

/** Hero for a component documentation page. */
export function DocHero({ id, eyebrow, title, lead, meta }: { id: string; eyebrow: string; title: string; lead: string; meta: string[] }) {
  return (
    <section className={ds.hero} aria-labelledby={id}>
      <div className={`container ${styles.heroInner}`}>
        <p className={`type-eyebrow ${ds.eyebrow}`}>{eyebrow}</p>
        <h1 id={id} className={`type-display-l ${styles.heroTitle}`}>
          {title}
        </h1>
        <p className={`type-body-l ${ds.heroLead}`}>{lead}</p>
        <ul className={ds.heroMeta} aria-label="Document status">
          {meta.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Grid of labelled specimens, one per state or variant. */
export function States({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={wide ? `${styles.states} ${styles.statesWide}` : styles.states}>{children}</div>;
}

export function State({ label, children, dark }: { label: string; children: ReactNode; dark?: boolean }) {
  return (
    <figure className={styles.state}>
      <div className={dark ? `${styles.stage} ${styles.stageDark}` : styles.stage}>{children}</div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function Example({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.example}>
      <p className={`type-eyebrow ${styles.exampleTitle}`}>{title}</p>
      {children}
    </div>
  );
}

/** A page-like frame on the paper canvas, for assembled screens. */
export function Frame({ children }: { children: ReactNode }) {
  return <div className={styles.frame}>{children}</div>;
}

/** The brief's test rule, accessibility notes and Figma variant name for a family. */
export function Spec({ test, a11y, figma }: { test: ReactNode; a11y: ReactNode; figma: string }) {
  return (
    <dl className={styles.spec}>
      <div>
        <dt>Test rule</dt>
        <dd>{test}</dd>
      </div>
      <div>
        <dt>Accessibility</dt>
        <dd>{a11y}</dd>
      </div>
      <div>
        <dt>Figma</dt>
        <dd>
          <code>{figma}</code>
        </dd>
      </div>
    </dl>
  );
}

export interface Decision {
  question: string;
  proposal: string;
}

export function Decisions({ items, approved }: { items: Decision[]; approved?: boolean }) {
  return (
    <ol className={ds.signoff}>
      {items.map(({ question, proposal }) => (
        <li key={question}>
          <h3 className="type-h3">
            {question}
            {approved ? (
              <span className={ds.approved}>
                <Icon name="check" size={20} />
                Approved
              </span>
            ) : null}
          </h3>
          <p>{proposal}</p>
        </li>
      ))}
    </ol>
  );
}
