import { Icon } from "@/components/icon/Icon";
import styles from "./Stepper.module.css";

interface StepperProps {
  /** Named stages, e.g. ["Your goals", "Your situation", "Preferences", "Review"]. */
  stages: string[];
  /** Zero-based index of the current stage. */
  current: number;
  label?: string;
}

/**
 * Stage-based progress (brief §7, family 05). Stage names, never a
 * percentage: branching makes "75%" untrue. In narrow containers the names
 * collapse and the caption carries the current stage.
 */
export function Stepper({ stages, current, label = "Assessment progress" }: StepperProps) {
  return (
    <nav className={styles.stepper} aria-label={label}>
      <p className={styles.caption}>
        Step {current + 1} of {stages.length} · {stages[current]}
      </p>
      <ol className={styles.list}>
        {stages.map((stage, i) => {
          const state = i < current ? "complete" : i === current ? "current" : "upcoming";
          return (
            <li key={stage} className={styles.item} data-state={state} aria-current={state === "current" ? "step" : undefined}>
              <span className={styles.bar} aria-hidden="true" />
              <span className={styles.name}>
                {state === "complete" ? <Icon name="check" size={20} /> : null}
                {stage}
                {state === "complete" ? <span className="visually-hidden"> (complete)</span> : null}
                {state === "upcoming" ? <span className="visually-hidden"> (not started)</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
