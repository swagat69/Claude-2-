import type { ReactNode } from "react";
import styles from "./Placeholder.module.css";

/**
 * Marks content that still needs approved wording or facts from the product,
 * legal or brand owner (brief §25). Every instance carries data-placeholder,
 * so launch checks can find what is left: grep "<Placeholder" in src.
 */
export function Placeholder({ note, children }: { note: string; children?: ReactNode }) {
  return (
    <span className={styles.placeholder} data-placeholder={note}>
      {children}
      <span className={styles.tag} title={note}>
        Placeholder<span className="visually-hidden">: {note}</span>
      </span>
    </span>
  );
}
