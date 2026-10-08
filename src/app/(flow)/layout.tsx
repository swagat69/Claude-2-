import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Notice } from "@/components/feedback/Notice";
import { Icon } from "@/components/icon/Icon";
import { Placeholder } from "@/components/placeholder/Placeholder";
import styles from "./flow.module.css";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/**
 * Focused shell for the assessment: no marketing navigation competing with
 * the task, but home and help are always one tap away. Answers are kept in
 * the tab, so leaving through either link loses nothing.
 */
export default function FlowLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href="/" className={styles.brand} aria-label="DFX home">
            <Wordmark />
          </Link>
          <Link href="/contact" className={styles.help}>
            <Icon name="help" size={20} />
            Get help
          </Link>
        </div>
      </header>
      <main id="main" className={styles.main}>
        <noscript>
          {/* Controls that only work with JavaScript are hidden rather than left dead. */}
          <style>{"[data-requires-js]{display:none!important}"}</style>
          <div className="container">
            <div className={styles.noscript}>
              <Notice tone="info" title="The assessment needs JavaScript">
                Turn on JavaScript to answer the questions, or <Link href="/contact">contact the team</Link> and we’ll
                help another way.
              </Notice>
            </div>
          </div>
        </noscript>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <nav aria-label="Footer">
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/privacy">Privacy notice</Link>
              </li>
              <li>
                <Link href="/terms">Terms of use</Link>
              </li>
              <li>
                <Link href="/accessibility">Accessibility</Link>
              </li>
              <li>
                <Link href="/contact">Contact us</Link>
              </li>
            </ul>
          </nav>
          <p className={styles.legal}>
            <Placeholder note="Registered legal entity name and UEN">© 2026 DFX Pte. Ltd. · UEN 000000000X</Placeholder>
          </p>
        </div>
      </footer>
    </div>
  );
}
