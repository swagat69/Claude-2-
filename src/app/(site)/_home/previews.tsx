import { Icon } from "@/components/icon/Icon";
import styles from "./previews.module.css";

/**
 * Static illustrations of the product, built from the design tokens rather
 * than screenshots (brief H0.2, H0.6). They contain no real data, invented
 * figures or scores, and wherever they appear they are labelled
 * "Illustrative preview" and kept away from assistive tech and keyboard.
 */

function Choice({ label, selected }: { label: string; selected?: boolean }) {
  return (
    <div className={styles.choice} data-selected={selected || undefined}>
      <span>{label}</span>
      <span className={styles.radio}>{selected ? <Icon name="check" size={20} /> : null}</span>
    </div>
  );
}

export function QuestionPreview({ variant = "situation" }: { variant?: "goal" | "situation" }) {
  const step = variant === "goal" ? 0 : 1;
  return (
    <div className={`${styles.card} ${styles.glass}`}>
      <p className={styles.meta}>
        Step {step + 1} of 4 · {variant === "goal" ? "Your goals" : "Your situation"}
      </p>
      <div className={styles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} data-state={i < step ? "done" : i === step ? "current" : "next"} />
        ))}
      </div>
      <p className={styles.question}>{variant === "goal" ? "What would you like help with?" : "What best describes your work?"}</p>
      <div className={styles.choices}>
        {variant === "goal" ? (
          <>
            <Choice label="Personal loan" />
            <Choice label="Debt consolidation" selected />
            <Choice label="Home renovation" />
          </>
        ) : (
          <>
            <Choice label="Full-time employee" selected />
            <Choice label="Self-employed" />
            <Choice label="Part-time or contract" />
          </>
        )}
      </div>
      <p className={styles.why}>
        <Icon name="help" size={20} />
        Why we ask
      </p>
    </div>
  );
}

export function ReviewPreview() {
  const rows = [
    ["What you need help with", "Debt consolidation"],
    ["Amount", "S$25,000"],
    ["Employment", "Full-time employee"],
    ["What matters most", "Lower monthly repayments"],
  ];
  return (
    <div className={styles.card}>
      <p className={styles.meta}>Step 4 of 4 · Review</p>
      <p className={styles.question}>Check your answers before we continue.</p>
      <dl className={styles.rows}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
            <span className={styles.change}>Change</span>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ResultPreview() {
  return (
    <div className={styles.card}>
      <span className={styles.tab}>Suggested route</span>
      <p className={styles.routeTitle}>Personal instalment loan</p>
      <ul className={styles.reasons}>
        <li>
          <Icon name="check" size={20} />
          One fixed monthly repayment
        </li>
        <li>
          <Icon name="check" size={20} />
          Accepts your type of employment
        </li>
      </ul>
      <span className={styles.fakeButton}>
        Discuss this option
        <Icon name="arrow-right" size={20} />
      </span>
    </div>
  );
}

export function CallPreview() {
  return (
    <div className={`${styles.card} ${styles.forest}`}>
      <span className={styles.callIcon}>
        <Icon name="phone" size={20} />
      </span>
      <p className={styles.callTitle}>A call is optional</p>
      <p className={styles.callText}>You choose if and when.</p>
    </div>
  );
}
