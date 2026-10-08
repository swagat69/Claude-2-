"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon/Icon";
import styles from "./Toast.module.css";

/**
 * Toasts are for brief, non-critical confirmations ("Answers saved") only.
 * Errors and anything the person must act on use an inline Notice, which
 * stays until they act (brief §13, family 08). Hence no "error" tone here.
 */
type ToastTone = "success" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  show: (message: string, options?: { tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** How long a toast stays when nobody is hovering or focusing it. */
export const TOAST_DURATION_MS = 6000;

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}

function Toast({ item, onDone }: { item: ToastItem; onDone: (id: number) => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => onDone(item.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [paused, item.id, onDone]);

  return (
    <div
      className={styles.toast}
      data-tone={item.tone}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon name={item.tone === "success" ? "check-circle" : "info"} className={styles.icon} />
      <p className={styles.message}>{item.message}</p>
      <button type="button" className={styles.dismiss} onClick={() => onDone(item.id)} aria-label="Dismiss notification">
        <Icon name="close" size={20} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const show = useCallback<ToastApi["show"]>((message, options) => {
    const id = ++nextId.current;
    // Newest first, at most three on screen.
    setItems((current) => [{ id, message, tone: options?.tone ?? "success" }, ...current].slice(0, 3));
  }, []);

  const remove = useCallback((id: number) => setItems((current) => current.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* The live region is always mounted, so screen readers hear toasts added to it. */}
      <div className={styles.region} role="status" aria-live="polite" aria-label="Notifications">
        {items.map((item) => (
          <Toast key={item.id} item={item} onDone={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
