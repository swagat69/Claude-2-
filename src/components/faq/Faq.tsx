import { useId, type ReactNode } from "react";
import { Icon } from "@/components/icon/Icon";
import styles from "./Faq.module.css";

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

/**
 * FAQ accordion on native <details> (brief §13 family 15, H0.7): keyboard
 * support for free, nothing opens by itself, and answers stay findable with
 * the browser's find-in-page. `exclusive` lets only one stay open.
 */
export function Faq({ items, exclusive = false }: { items: FaqItem[]; exclusive?: boolean }) {
  const group = useId();
  return (
    <div className={styles.faq}>
      {items.map((item) => (
        <details key={item.question} className={styles.item} name={exclusive ? group : undefined}>
          <summary className={styles.summary}>
            <span className={styles.question}>{item.question}</span>
            <span className={styles.toggle} aria-hidden="true">
              <Icon name="plus" size={20} className={styles.plus} />
              <Icon name="minus" size={20} className={styles.minus} />
            </span>
          </summary>
          <div className={styles.answer}>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
