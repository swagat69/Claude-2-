import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icon/Icon";
import type { category } from "@/design/tokens";
import { Pictogram, type PictogramName } from "./Pictogram";
import styles from "./CategoryTile.module.css";

export type TileTheme = keyof typeof category;

interface CategoryTileProps {
  theme: TileTheme;
  pictogram: PictogramName;
  title: string;
  text: string;
  href: string;
  /** Visual cue only; the link's name is the title. */
  linkLabel?: string;
}

/**
 * Ticket-cut category tile from image 4 (brief H0.5, family 16). The title is
 * the link and its hit area stretches over the whole tile. Each theme has a
 * fixed text colour, checked in the contrast audit. The focus ring is drawn on
 * the unmasked outer element, so the ticket cut never clips it.
 */
export function CategoryTile({ theme, pictogram, title, text, href, linkLabel = "Explore" }: CategoryTileProps) {
  return (
    <article
      className={styles.tile}
      style={
        { "--tile-bg": `var(--category-${theme}-bg)`, "--tile-fg": `var(--category-${theme}-fg)` } as CSSProperties
      }
    >
      <div className={styles.ticket}>
        <div className={styles.head}>
          <div className={styles.copy}>
            <h3 className={styles.title}>
              <Link href={href} className={styles.link}>
                {title}
              </Link>
            </h3>
            <p className={styles.text}>{text}</p>
          </div>
          <Pictogram name={pictogram} className={styles.pictogram} />
        </div>
        <div className={styles.foot} aria-hidden="true">
          <span className={styles.explore}>
            {linkLabel}
            <Icon name="arrow-right" size={20} />
          </span>
        </div>
      </div>
    </article>
  );
}
