import { Icon } from "@/components/icon/Icon";
import styles from "../ds.module.css";

export interface TocItem {
  id: string;
  title: string;
}

function TocList({ items }: { items: TocItem[] }) {
  return (
    <ol className={styles.tocList}>
      {items.map(({ id, title }, i) => (
        <li key={id}>
          <a href={`#${id}`}>
            <span className={styles.tocNum}>{String(i + 1).padStart(2, "0")}</span>
            {title}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** "On this page" contents: a disclosure on small screens, a sticky list from 1024px. */
export function Toc({ items }: { items: TocItem[] }) {
  return (
    <nav className={styles.toc} aria-label="On this page">
      <details className={styles.tocMobile}>
        <summary>
          On this page
          <Icon name="chevron-down" size={20} />
        </summary>
        <TocList items={items} />
      </details>
      <div className={styles.tocDesktop}>
        <p className={`type-eyebrow ${styles.muted}`}>On this page</p>
        <TocList items={items} />
      </div>
    </nav>
  );
}
