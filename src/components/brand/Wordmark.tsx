import styles from "./Wordmark.module.css";

/** Placeholder text wordmark until DFX brand assets exist. */
export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={inverse ? `${styles.wordmark} ${styles.inverse}` : styles.wordmark}>
      DFX
      <span className={styles.signal} aria-hidden="true" />
    </span>
  );
}
