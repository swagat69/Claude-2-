"use client";

import { useEffect, useId, useRef, type MouseEvent } from "react";
import styles from "./ErrorSummary.module.css";

export interface SummaryError {
  /** id of the input to focus; for a radio group, the first radio's id. */
  fieldId: string;
  message: string;
}

/**
 * Shown at the top of a step after a failed submit (brief §18, GOV.UK error
 * summary). Takes focus so screen readers hear it; each link moves focus to
 * its field. `attempt` changes on every submit so focus returns each time.
 */
export function ErrorSummary({ errors, attempt }: { errors: SummaryError[]; attempt: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (errors.length) ref.current?.focus();
  }, [attempt, errors.length]);

  if (!errors.length) return null;

  const goTo = (event: MouseEvent<HTMLAnchorElement>, fieldId: string) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    event.preventDefault();
    field.focus({ preventScroll: true });
    // Bring the label or legend into view with the field, not just the input.
    (field.closest("fieldset, [data-invalid]") ?? field).scrollIntoView({ block: "center" });
  };

  return (
    <div ref={ref} className={styles.summary} tabIndex={-1} role="alert" aria-labelledby={titleId}>
      <h2 id={titleId} className="type-h3">
        There is a problem
      </h2>
      <ul className={styles.list}>
        {errors.map(({ fieldId, message }) => (
          <li key={fieldId}>
            <a href={`#${fieldId}`} onClick={(e) => goTo(e, fieldId)}>
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
