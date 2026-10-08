"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { ButtonLink } from "@/components/button/Button";
import { Icon } from "@/components/icon/Icon";
import { Dialog } from "@/components/overlay/Dialog";
import styles from "./SiteHeader.module.css";

export interface NavLink {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  links: NavLink[];
  cta: { href: string; label: string; shortLabel: string };
  /** Force a state for documentation; otherwise it follows the scroll position. */
  compact?: boolean;
  /** Sticky from 768px. Off for previews. */
  sticky?: boolean;
}

/**
 * Global header (brief H0.1, family 18). From 768px it sticks and compresses
 * from 78px to 64px once you scroll; on phones it is a plain 64px row that
 * scrolls away, so it never covers content. Below ~960px of width the links
 * move into a menu sheet.
 */
export function SiteHeader({ links, cta, compact: forcedCompact, sticky = true }: SiteHeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!sticky) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 64));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [sticky]);

  const compact = forcedCompact ?? scrolled;
  const linkList = (
    <ul className={styles.linkList}>
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={styles.link}
            aria-current={pathname === link.href ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <header className={styles.header} data-compact={compact || undefined} data-sticky={sticky || undefined}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="DFX home">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className={styles.wideNav}>
          {linkList}
        </nav>
        <div className={styles.actions}>
          <ButtonLink href={cta.href} size="compact" className={styles.ctaLong}>
            {cta.label}
          </ButtonLink>
          <ButtonLink href={cta.href} size="compact" className={styles.ctaShort}>
            {cta.shortLabel}
          </ButtonLink>
          <button
            type="button"
            className={styles.menuButton}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
            Menu
          </button>
        </div>
      </div>
      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" size="small">
        <nav aria-label="Main" className={styles.sheetNav}>
          {linkList}
        </nav>
        <ButtonLink
          href={cta.href}
          fullWidth
          iconEnd="arrow-right"
          className={styles.sheetCta}
          onClick={() => setMenuOpen(false)}
        >
          {cta.label}
        </ButtonLink>
      </Dialog>
    </header>
  );
}

/** "Back" as a real link, so browser history and new tabs keep working. */
export function BackLink({ href, children = "Back" }: { href: string; children?: string }) {
  return (
    <ButtonLink href={href} variant="tertiary" size="compact" iconStart="arrow-left" className={styles.back}>
      {children}
    </ButtonLink>
  );
}
