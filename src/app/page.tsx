import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Icon } from "@/components/icon/Icon";
import styles from "./hub.module.css";

/**
 * Temporary build hub listing the six design parts. The marketing homepage
 * replaces this route in Part 3, and the hub moves to /hub.
 */
const parts = [
  { title: "Foundations", detail: "Colour, type, space, radius, elevation, grid and motion tokens.", brief: "§11–§16", href: "/design-system", status: "Approved" },
  {
    title: "Component library",
    detail: "2a form controls are ready; 2b feedback and overlays, and 2c cards and booking, follow.",
    brief: "§13",
    href: "/design-system/components",
    status: "2a in review",
  },
  { title: "Homepage", detail: "Header, hero, proof, how it works, use cases, preview, FAQ, support and footer, with scroll motion.", brief: "§6, §15", status: "Planned" },
  { title: "Assessment", detail: "Start screen, three question stages, review and consent, with branching.", brief: "§7, §8", status: "Planned" },
  { title: "WhatsApp and email handoff", detail: "Channel choice, handoff preview, secure email link and processing state.", brief: "§9", status: "Planned" },
  { title: "Results and call", detail: "Match, manual review, no match and error states, then booking and confirmation.", brief: "§10", status: "Planned" },
];

export default function Hub() {
  return (
    <main id="main" className={`container ${styles.hub}`}>
      <Wordmark />
      <h1 className={`type-display-l ${styles.title}`}>Loan matching, designed step by step.</h1>
      <p className={`type-body-l ${styles.lead}`}>
        The DFX website is being designed in six parts, following the design brief. Each part is reviewed before
        the next one starts.
      </p>
      <ol className={styles.parts}>
        {parts.map((part, i) => {
          const body = (
            <>
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.text}>
                <span className="type-h3">{part.title}</span>
                <span className={styles.detail}>{part.detail}</span>
                <span className={`type-meta ${styles.brief}`}>Brief {part.brief}</span>
              </span>
              <span className={styles.status} data-status={part.status}>
                {part.status}
              </span>
              {part.href ? <Icon name="arrow-right" className={styles.arrow} /> : <span aria-hidden="true" />}
            </>
          );
          return (
            <li key={part.title}>
              {part.href ? (
                <Link href={part.href} className={styles.part}>
                  {body}
                </Link>
              ) : (
                <div className={styles.part}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
