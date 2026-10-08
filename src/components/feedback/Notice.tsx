import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import styles from "./Notice.module.css";

export type Tone = "info" | "success" | "warning" | "error";

const toneIcon: Record<Tone, IconName> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  error: "alert-circle",
};

const toneLabel: Record<Tone, string> = {
  info: "Information",
  success: "Success",
  warning: "Warning",
  error: "Error",
};

interface NoticeProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  /** Shows a close button. Leave out for anything the person still has to act on (brief §13: critical errors persist). */
  onDismiss?: () => void;
  /**
   * Set only when the notice appears in response to something the person did:
   * "polite" for status, "assertive" for an error that blocks them. A notice
   * present on page load needs neither.
   */
  live?: "polite" | "assertive";
}

/** Inline notice (brief §13, family 08). Tone is carried by icon, heading and hidden label, never colour alone. */
export function Notice({ tone = "info", title, children, actions, onDismiss, live }: NoticeProps) {
  return (
    <div
      className={styles.notice}
      data-tone={tone}
      role={live === "assertive" ? "alert" : live === "polite" ? "status" : undefined}
    >
      <span className={styles.icon}>
        <Icon name={toneIcon[tone]} label={toneLabel[tone]} />
      </span>
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <div className={styles.text}>{children}</div> : null}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
          <Icon name="close" size={20} />
        </button>
      ) : null}
    </div>
  );
}
