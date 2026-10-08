"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import styles from "./Reveal.module.css";

type RevealState = "static" | "pending" | "in";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** Share of the element that must be visible before it plays (brief §15: 0.15–0.25). */
  amount?: number;
  /** Position in a staggered group; multiplied by the reveal stagger token. */
  index?: number;
  /** "rise" fades up by the reveal distance; "fade" only fades. */
  variant?: "rise" | "fade";
  className?: string;
  id?: string;
}

/**
 * Enter-once scroll reveal (brief §14–15). Safe by construction:
 * - Without JavaScript, nothing is hidden.
 * - Content already on screen at load is never hidden or animated.
 * - Only content that starts below the fold waits, and it plays once.
 * - With reduced motion, nothing is hidden and nothing moves.
 */
export function Reveal({ children, as: Tag = "div", amount = 0.2, index = 0, variant = "rise", className, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<RevealState>("static");

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          if (entry.isIntersecting) {
            observer.disconnect();
            return;
          }
          setState("pending");
          return;
        }
        if (entry.isIntersecting) {
          setState("in");
          observer.disconnect();
        }
      },
      { threshold: amount },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [amount]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={[styles.reveal, className].filter(Boolean).join(" ")}
      data-reveal={state}
      data-variant={variant}
      style={{ "--reveal-index": index } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
