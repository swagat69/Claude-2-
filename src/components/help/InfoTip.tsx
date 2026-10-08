"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon/Icon";
import styles from "./InfoTip.module.css";

/**
 * Toggletip for a short explanation next to a label (brief §13, family 14).
 * A button, not hover, so it works with touch, mouse and keyboard alike; the
 * text is written into a live region when opened, so screen readers read it.
 * Escape or a tap elsewhere closes it.
 */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const id = useId();
  const wrapper = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  // Keep the bubble on screen: nudge it left if it would cross the right edge.
  // A layout offset, not a transform: phones size the page from an untransformed box.
  useLayoutEffect(() => {
    if (!open || !bubble.current) return;
    const margin = 16;
    // The measured box already includes the previous nudge, so take it back out first.
    const naturalRight = bubble.current.getBoundingClientRect().right - shift;
    const overflow = naturalRight - (document.documentElement.clientWidth - margin);
    setShift(overflow > 0 ? -overflow : 0);
    // Measure once per opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <span ref={wrapper} className={styles.wrapper}>
      <button
        ref={button}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="help" size={20} />
        <span className="visually-hidden">{label}</span>
      </button>
      <span
        ref={bubble}
        id={id}
        role="status"
        className={styles.bubble}
        data-open={open || undefined}
        style={{ left: shift }}
      >
        {open ? children : null}
      </span>
    </span>
  );
}
