import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { business } from "@/config/business";
import { footerGroups } from "@/config/site";
import styles from "./SiteFooter.module.css";

/** Footer (brief H0.9): legal entity, policies, accessibility contact and real support channels. */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Wordmark />
          <p className={styles.tagline}>
            Loan matching for Singapore. We help you find a route that fits, then you decide.
          </p>
        </div>
        <nav className={styles.groups} aria-label="Footer">
          {footerGroups.map((group) => (
            <div key={group.title} className={styles.group}>
              <h2 className={styles.groupTitle}>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className={styles.legal}>
          <p>
            © 2026 {business.legalName ?? "DFX"}{business.uen ? ` · UEN ${business.uen}` : ""}
          </p>
          <p>{business.regulatoryLine}</p>
          <p>{business.feeLine}</p>
        </div>
      </div>
    </footer>
  );
}
