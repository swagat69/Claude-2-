import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon: IconName;
  title: ReactNode;
  /** The real reason, in plain words, then what still works (brief §13 family 20). */
  children: ReactNode;
  /** One clear next action first; a quieter alternative after it. */
  actions: ReactNode;
  headingLevel?: 1 | 2;
}

/** Whole-view message for no result, no connection, an expired link or a lost session. */
export function EmptyState({ icon, title, children, actions, headingLevel = 2 }: EmptyStateProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div className={styles.empty}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name={icon} size={32} />
      </span>
      <Heading className={`type-h2 ${styles.title}`}>{title}</Heading>
      <div className={styles.body}>{children}</div>
      <div className={styles.actions}>{actions}</div>
    </div>
  );
}
