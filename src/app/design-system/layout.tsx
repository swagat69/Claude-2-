import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { DocNav } from "./_doc/DocNav";
import styles from "./shell.module.css";

export default function DesignSystemLayout({ children }: LayoutProps<"/design-system">) {
  return (
    <>
      <header className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <Link href="/" className={styles.brand}>
            <Wordmark />
            <span className={styles.brandLabel}>Design system</span>
          </Link>
          <DocNav />
        </div>
      </header>
      {children}
      <footer className={styles.footer}>
        <div className="container">
          <p className="type-meta">Built from the DFX Design Brief v1.0 (8 October 2026).</p>
        </div>
      </footer>
    </>
  );
}
