import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import styles from "./AdvisorPanel.module.css";

interface AdvisorPanelProps {
  title: string;
  body: ReactNode;
  /** A real role, e.g. "A DFX loan specialist". A name and photo only when they are genuine. */
  who: string;
  duration: string;
  format: string;
  /** What the call covers, so the commitment is clear before booking (brief C1). */
  agenda: string[];
  /** "Choose a time". */
  action: ReactNode;
  /** A way to say no that keeps the result on screen. */
  decline: ReactNode;
}

function Meta({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <li>
      <Icon name={icon} size={20} />
      {children}
    </li>
  );
}

/** Call invitation shown after the result has been explained (brief §10 C1, family 12). */
export function AdvisorPanel({ title, body, who, duration, format, agenda, action, decline }: AdvisorPanelProps) {
  return (
    <aside className={styles.panel} data-surface="inverse" aria-label="Talk to our team">
      <div className={styles.who}>
        <span className={styles.avatar} aria-hidden="true">
          <Icon name="user" />
        </span>
        <p>{who}</p>
      </div>
      <h2 className={`type-h2 ${styles.title}`}>{title}</h2>
      <p className={styles.body}>{body}</p>
      <ul className={styles.meta}>
        <Meta icon="clock">{duration}</Meta>
        <Meta icon="phone">{format}</Meta>
      </ul>
      <div className={styles.agenda}>
        <p className={styles.agendaLabel}>In the call</p>
        <ol>
          {agenda.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>
      <div className={styles.actions}>
        {action}
        {decline}
      </div>
    </aside>
  );
}
