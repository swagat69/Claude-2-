import Image from "next/image";
import type { CSSProperties } from "react";
import { Placeholder } from "@/components/placeholder/Placeholder";
import type { PhotoAsset } from "@/config/media";
import styles from "./Photo.module.css";

interface PhotoProps {
  /** The real photo, from src/config/media.ts. Null shows a placeholder of the same size. */
  asset: PhotoAsset | null;
  /** What the missing photo should show: the Placeholder note. */
  needed: string;
  /** Short visible label on a portrait placeholder, e.g. "Team photo". */
  label?: string;
  variant?: "portrait" | "avatar";
  /** Avatar diameter in px. */
  size?: number;
  /** Rendered width hint for the real image, e.g. "(min-width: 1024px) 540px, 100vw". */
  sizes?: string;
  className?: string;
}

/** A head-and-shoulders outline, so a placeholder reads as "a photo of a person goes here". */
function Silhouette() {
  return (
    <svg className={styles.silhouette} viewBox="0 0 100 125" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <circle cx="50" cy="50" r="17" />
      <path d="M16 125c0-30 15-46 34-46s34 16 34 46z" />
    </svg>
  );
}

/**
 * A real photo of a real person, or a clearly labelled space for one (brief
 * H0.8, §11: authentic photos only, never stock or generated people). The
 * placeholder keeps the final size, so nothing moves when the photo arrives.
 */
export function Photo({ asset, needed, label, variant = "portrait", size = 44, sizes, className }: PhotoProps) {
  const classes = [styles.photo, styles[variant], asset ? null : styles.empty, className].filter(Boolean).join(" ");
  const style = variant === "avatar" ? ({ "--avatar-size": `${size}px` } as CSSProperties) : undefined;

  if (asset) {
    return (
      <span className={classes} style={style}>
        <Image
          src={asset.src}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          sizes={sizes ?? (variant === "avatar" ? `${size}px` : "100vw")}
          className={styles.image}
        />
      </span>
    );
  }

  return (
    <span className={classes} style={style} data-placeholder={needed}>
      <Silhouette />
      {variant === "portrait" ? (
        <span className={styles.label}>
          <Placeholder note={needed}>{label}</Placeholder>
        </span>
      ) : null}
    </span>
  );
}
