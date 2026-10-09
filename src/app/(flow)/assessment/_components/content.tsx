import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import type { GateReason } from "@/lib/assessment/questions.ts";
import styles from "./assessment.module.css";

/**
 * Hard-stop wording (brief §8): states the policy plainly, never "you
 * failed", and always leaves a way to correct a mistaken answer. The rules
 * match what Singapore banks require (docs/decisions.md).
 */
export const gateCopy: Record<GateReason, { inline: string; title: string; body: string }> = {
  residency: {
    inline: "We can only help people who live in Singapore at the moment.",
    title: "We can only help people living in Singapore",
    body: "The banks and financial institutions we work with lend only to people who live in Singapore as citizens, permanent residents or work pass holders, so we can’t suggest a route for you right now.",
  },
  age: {
    inline: "We can only help people aged 21 or over.",
    title: "We can only help people aged 21 or over",
    body: "The banks and financial institutions we work with lend only to people aged 21 or over, so we can’t suggest a route for you right now.",
  },
  "business-jurisdiction": {
    inline: "We can only help businesses registered in Singapore at the moment.",
    title: "We can only help businesses registered in Singapore",
    body: "The banks and financial institutions we work with lend only to businesses registered in Singapore with a UEN, so we can’t suggest a route for this business right now.",
  },
};

function RailItem({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <li className={styles.railItem}>
      <span className={styles.railIcon} aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
      <span>
        <strong>{title}</strong>
        <span className={styles.railText}>{children}</span>
      </span>
    </li>
  );
}

/** A2 side panel (brief A2: 280px "What to expect"). */
export function SituationRail() {
  return (
    <div className={styles.railCard}>
      <h2 className="type-h3">What to expect</h2>
      <ul className={styles.railList}>
        <RailItem icon="document" title="Next: your preferences">
          Then a summary of every answer, with a Change link beside each group.
        </RailItem>
        <RailItem icon="lock" title="Nothing is sent yet">
          Your answers stay in this browser tab until you check them and choose how to continue.
        </RailItem>
        <RailItem icon="help" title="Ranges, not exact figures">
          Where we ask about money, a rough range is enough.
        </RailItem>
      </ul>
      <p className={styles.railHelp}>
        Questions? <Link href="/contact">Contact the team</Link>
      </p>
    </div>
  );
}

/** A2 on phones: the rail's essential promise, below the fields (brief A2). */
export function TrustNote() {
  return (
    <p className={styles.trustNote}>
      <Icon name="lock" size={20} />
      <span>Nothing is sent until you’ve checked your answers on the last step.</span>
    </p>
  );
}

/** A4 side panel (brief A4: 300px support rail). */
export function ReviewRail() {
  return (
    <div className={styles.railCard}>
      <h2 className="type-h3">What happens next</h2>
      <ol className={styles.railSteps}>
        <li>You open WhatsApp or get a secure link by email. Your answers stay saved here.</li>
        <li>
          We check your answers straight away. If anything needs a closer look, a specialist reviews it within one
          working day.
        </li>
        <li>You see the routes that may fit, and why.</li>
        <li>You decide whether to talk to us. A call is never required.</li>
      </ol>
      <p className={styles.railHelp}>
        Questions? <Link href="/contact">Contact the team</Link>
      </p>
    </div>
  );
}
