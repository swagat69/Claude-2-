import styles from "./Wordmark.module.css";

/** Text wordmark: kept as the logo until DFX commissions brand assets (docs/decisions.md). */
export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={inverse ? `${styles.wordmark} ${styles.inverse}` : styles.wordmark}>
      DFX
      <span className={styles.signal} aria-hidden="true" />
    </span>
  );
}
