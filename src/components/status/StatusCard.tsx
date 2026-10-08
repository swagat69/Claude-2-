import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import styles from "./StatusCard.module.css";

/**
 * The real states of an assessment (brief §9 M1, §10 R1–R4, §20). Each one
 * looks and reads differently, so "no match" is never mistaken for an error
 * and nothing gets a green tick that the product hasn't earned.
 */
export type Status = "processing" | "fit" | "review" | "no-match" | "unavailable";

const statusMeta: Record<Status, { icon: IconName; eyebrow: string }> = {
  processing: { icon: "clock", eyebrow: "Checking your answers" },
  fit: { icon: "check-circle", eyebrow: "Result ready" },
  review: { icon: "user", eyebrow: "A person will review this" },
  "no-match": { icon: "route", eyebrow: "No suitable option right now" },
  unavailable: { icon: "alert-triangle", eyebrow: "Temporarily unavailable" },
};

export interface StatusStep {
  label: string;
  state: "done" | "current" | "pending";
}

const stepText: Record<StatusStep["state"], string> = {
  done: "done",
  current: "in progress",
  pending: "not started",
};

interface StatusCardProps {
  status: Status;
  title: ReactNode;
  children?: ReactNode;
  /** What is genuinely happening, from the backend. Never a timer or a percentage (brief M1). */
  steps?: StatusStep[];
  actions?: ReactNode;
  headingLevel?: 1 | 2;
  id?: string;
}

export function StatusCard({ status, title, children, steps, actions, headingLevel = 2, id }: StatusCardProps) {
  const meta = statusMeta[status];
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const titleId = id ? `${id}-title` : undefined;
  return (
    <section id={id} className={styles.card} data-status={status} aria-labelledby={titleId}>
      <div className={styles.top}>
        <span className={styles.badge} aria-hidden="true">
          <Icon name={meta.icon} />
        </span>
        <p className={styles.eyebrow}>{meta.eyebrow}</p>
      </div>
      <Heading id={titleId} className={`type-h2 ${styles.title}`} tabIndex={-1}>
        {title}
      </Heading>
      {children ? <div className={styles.body}>{children}</div> : null}
      {steps?.length ? (
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.label} data-state={step.state}>
              <span className={styles.stepMark} aria-hidden="true">
                {step.state === "done" ? <Icon name="check" size={20} /> : null}
              </span>
              {step.label}
              <span className="visually-hidden"> ({stepText[step.state]})</span>
            </li>
          ))}
        </ol>
      ) : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
}
