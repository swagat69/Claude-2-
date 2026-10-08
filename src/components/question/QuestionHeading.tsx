import type { ReactNode, Ref } from "react";
import { Icon } from "@/components/icon/Icon";
import styles from "./QuestionHeading.module.css";

/**
 * "Why we ask": just-in-time reason for a sensitive question (brief §5, §7).
 * A native disclosure, so it opens with touch, mouse and keyboard.
 */
export function WhyWeAsk({ summary = "Why we ask", children }: { summary?: string; children: ReactNode }) {
  return (
    <details className={styles.why}>
      <summary>
        <Icon name="help" size={20} />
        {summary}
        <Icon name="chevron-down" size={20} className={styles.chevron} />
      </summary>
      <div className={styles.whyBody}>{children}</div>
    </details>
  );
}

interface QuestionHeadingProps {
  title: ReactNode;
  lead?: ReactNode;
  why?: ReactNode;
  whySummary?: string;
  /** Small print that must stay readable, e.g. "This won't affect your credit score." */
  note?: ReactNode;
  /** The page moves focus here after each step transition (brief §7). */
  headingRef?: Ref<HTMLHeadingElement>;
  id?: string;
}

/** Page title for a multi-field step. For a single-question step, use a Fieldset legend as the h1. */
export function QuestionHeading({ title, lead, why, whySummary, note, headingRef, id }: QuestionHeadingProps) {
  return (
    <header className={styles.question}>
      <h1 ref={headingRef} id={id} tabIndex={-1} className={`type-h1 ${styles.title}`}>
        {title}
      </h1>
      {lead ? <p className={`type-body-l ${styles.lead}`}>{lead}</p> : null}
      {why ? <WhyWeAsk summary={whySummary}>{why}</WhyWeAsk> : null}
      {note ? (
        <p className={styles.note}>
          <Icon name="info" size={20} />
          <span>{note}</span>
        </p>
      ) : null}
    </header>
  );
}
