import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Notice } from "@/components/feedback/Notice";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { SiteFooter } from "@/components/nav/SiteFooter";
import { navLinks } from "@/config/site";
import styles from "./flow.module.css";

export const metadata: Metadata = { robots: { index: false, follow: true } };
export default function FlowLayout({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>
    <SiteHeader links={navLinks.filter(link => link.href !== "/contact")} cta={{ href: "/contact", label: "Get help", shortLabel: "Get help", variant: "secondary" }} />
    <main id="main" className={styles.main}>
      <noscript><style>{"[data-requires-js]{display:none!important}"}</style><div className="container"><div className={styles.noscript}><Notice tone="info" title="The assessment needs JavaScript">Turn on JavaScript to answer the questions, or <Link href="/contact">see support information</Link>.</Notice></div></div></noscript>
      {children}
    </main><SiteFooter />
  </div>;
}
