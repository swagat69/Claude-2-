import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ReviewSummary.module.css";

export interface ReviewRow {
  label: string;
  /** null = an optional question left blank; shown as "Not provided", never as 0. */
  value: ReactNode | null;
  /** Per-answer change link, for long groups. */
  changeHref?: string;
}

export interface ReviewGroup {
  id: string;
  title: string;
  /** Returns to that step, then back to this review with every other answer kept (brief A4). */
  changeHref?: string;
  rows: ReviewRow[];
}

export function ReviewSummary({ groups }: { groups: ReviewGroup[] }) {
  return (
    <div className={styles.summary}>
      {groups.map((group) => (
        <section key={group.id} className={styles.group} aria-labelledby={`${group.id}-title`}>
          <header className={styles.head}>
            <h2 id={`${group.id}-title`} className="type-h3">
              {group.title}
            </h2>
            {group.changeHref ? (
              <Link href={group.changeHref} className={styles.change}>
                Change<span className="visually-hidden"> {group.title.toLowerCase()}</span>
              </Link>
            ) : null}
          </header>
          <dl className={styles.rows}>
            {group.rows.map((row) => (
              <div key={row.label} className={styles.row}>
                <dt className={styles.label}>{row.label}</dt>
                <dd className={styles.value}>
                  {row.value ?? <span className={styles.missing}>Not provided</span>}
                </dd>
                {row.changeHref ? (
                  <dd className={styles.rowAction}>
                    <Link href={row.changeHref} className={styles.change}>
                      Change<span className="visually-hidden"> {row.label.toLowerCase()}</span>
                    </Link>
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
