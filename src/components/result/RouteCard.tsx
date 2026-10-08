import type { ReactNode } from "react";
import { Icon } from "@/components/icon/Icon";
import styles from "./RouteCard.module.css";

export interface RouteFact {
  label: string;
  value: ReactNode;
}

interface RouteCardProps {
  /**
   * Neutral by default. Never "Top pick" or "Best match" unless there is a
   * real, disclosed ranking behind it (brief §10 results-card anatomy).
   */
  eyebrow?: string;
  title: string;
  /** One or two plain-language reasons derived from the answers. */
  reasons: string[];
  /** Verified facts only: provider, costs, timing, rates. Leave out anything unconfirmed. */
  facts?: RouteFact[];
  /** Date the facts were true, e.g. "Estimates as of 8 Oct 2026". Required whenever facts are shown. */
  factsAsOf?: string;
  /** The specific next step, e.g. "Discuss this option". */
  action: ReactNode;
  /** Longer explanation, folded away until asked for. */
  details?: ReactNode;
  /** Required disclosures. Stays legible, never faded out. */
  smallPrint?: ReactNode;
  headingLevel?: 2 | 3;
}

export function RouteCard({
  eyebrow = "Suggested route",
  title,
  reasons,
  facts,
  factsAsOf,
  action,
  details,
  smallPrint,
  headingLevel = 3,
}: RouteCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={styles.card}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <Heading className={styles.title}>{title}</Heading>

      <div className={styles.fit}>
        <p className={styles.fitLabel}>Why it may fit</p>
        <ul className={styles.reasons}>
          {reasons.map((reason) => (
            <li key={reason}>
              <Icon name="check" size={20} />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {facts?.length ? (
        <div className={styles.factsWrap}>
          <dl className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          {factsAsOf ? <p className={styles.asOf}>{factsAsOf}</p> : null}
        </div>
      ) : null}

      <div className={styles.footer}>
        {action}
        {details ? (
          <details className={styles.details}>
            <summary>
              More about this route
              <Icon name="chevron-down" size={20} />
            </summary>
            <div className={styles.detailsBody}>{details}</div>
          </details>
        ) : null}
      </div>

      {smallPrint ? <p className={styles.smallPrint}>{smallPrint}</p> : null}
    </article>
  );
}
