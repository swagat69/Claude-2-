"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { Icon } from "@/components/icon/Icon";
import styles from "./Dialog.module.css";

interface DialogProps {
  open: boolean;
  /** Called however the dialog closes: close button, Escape, backdrop or code. */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Actions, most important first. They stack full-width on phones. */
  footer?: ReactNode;
  size?: "small" | "medium";
  /** Close on backdrop click. Turn off when closing would lose work. */
  dismissible?: boolean;
  /** Where focus starts. For a destructive confirmation, the safe choice. Defaults to the first control. */
  initialFocus?: RefObject<HTMLElement | null>;
}

/**
 * Modal dialog on wider screens, bottom sheet on phones (brief §13, family
 * 09). The native <dialog> gives the focus trap, Escape to close and an inert
 * page behind it; focus goes back to whatever opened it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "medium",
  dismissible = true,
  initialFocus,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    if (!dialog.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      initialFocus?.current?.focus();
    }
    // Also runs when the route is hidden or unmounted, so no modal outlives its page.
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open, initialFocus]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      data-size={size}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={() => {
        onClose();
        opener.current?.focus();
      }}
      onClick={(event) => {
        // The panel fills the dialog, so only a backdrop click targets the dialog itself.
        if (dismissible && event.target === event.currentTarget) ref.current?.close();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.head}>
          <h2 id={titleId} className="type-h2">
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={() => ref.current?.close()} aria-label="Close">
            <Icon name="close" />
          </button>
        </header>
        {description ? (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        ) : null}
        {children ? <div className={styles.content}>{children}</div> : null}
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </dialog>
  );
}
