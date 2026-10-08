"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./AmbientOrb.module.css";

interface AmbientOrbProps {
  color?: "blush" | "green" | "amber" | "lime";
  /** Diameter in px; the brief's range is 320–520 radius at hero scale. */
  size?: number;
  intensity?: "soft" | "strong";
  /** Pointer parallax multiplier: 0 = still, 1 = full token distance (≤16px). */
  depth?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Decorative glow (brief §11, family 17). Hidden from assistive tech, never
 * catches clicks, and only drifts with the pointer on hover-capable devices
 * with motion allowed. Position it from the parent with className/style.
 */
export function AmbientOrb({ color = "blush", size = 420, intensity = "strong", depth = 1, className, style }: AmbientOrbProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const orb = ref.current;
    const canMove =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!orb || !canMove || depth === 0) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        orb.style.setProperty("--px", String(((event.clientX / window.innerWidth) * 2 - 1) * depth));
        orb.style.setProperty("--py", String(((event.clientY / window.innerHeight) * 2 - 1) * depth));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [depth]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={[styles.orb, className].filter(Boolean).join(" ")}
      style={
        {
          "--orb-color": `var(--glow-${color})`,
          "--orb-size": `${size}px`,
          "--orb-opacity": `var(--glow-opacity-${intensity})`,
          ...style,
        } as CSSProperties
      }
    />
  );
}
