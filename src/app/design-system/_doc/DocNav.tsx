"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../shell.module.css";

const links = [
  { href: "/design-system", label: "Foundations" },
  { href: "/design-system/components", label: "Components" },
];

export function DocNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Design system">
      <ul className={styles.nav}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} aria-current={pathname === href ? "page" : undefined}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
