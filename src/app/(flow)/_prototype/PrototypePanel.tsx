"use client";

import type { ReactNode } from "react";
import { api, type PrototypeSettings } from "@/lib/service/api.ts";
import { usePrototypeSettings } from "@/lib/service/hooks.ts";
import styles from "./prototype.module.css";

/**
 * Review-only controls. They stand in for WhatsApp, email and DFX's systems
 * so every state of Parts 5 and 6 can be tried. Not part of the design, and
 * removed when the real services are connected.
 */
export function PrototypePanel({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <aside className={styles.panel} aria-label={`Prototype controls: ${title}`}>
      <details open>
        <summary>
          <span className={styles.tag}>Prototype only</span>
          <span className={styles.title}>{title}</span>
        </summary>
        <div className={styles.body}>
          <p className={styles.note}>
            Stands in for WhatsApp, email and DFX’s systems so you can try every state. Not part of the design.
          </p>
          {children}
        </div>
      </details>
    </aside>
  );
}

type Option<K extends keyof PrototypeSettings> = { value: PrototypeSettings[K]; label: string };

/** One prototype setting as a small radio group. */
export function SettingChoice<K extends keyof PrototypeSettings>({
  setting,
  label,
  options,
}: {
  setting: K;
  label: string;
  options: Option<K>[];
}) {
  const settings = usePrototypeSettings();
  return (
    <fieldset className={styles.setting}>
      <legend>{label}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={String(option.value)}>
            <input
              type="radio"
              name={`prototype-${setting}`}
              value={String(option.value)}
              checked={settings?.[setting] === option.value}
              onChange={() => api.setSettings({ [setting]: option.value } as Partial<PrototypeSettings>)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function PrototypeActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}

/** A message as it would arrive in WhatsApp or the inbox, with its link. */
export function PrototypeMessage({
  from,
  meta,
  children,
  mine,
}: {
  from: string;
  meta?: string;
  children: ReactNode;
  mine?: boolean;
}) {
  return (
    <div className={styles.message} data-mine={mine || undefined}>
      <p className={styles.from}>
        <strong>{from}</strong>
        {meta ? <span> · {meta}</span> : null}
      </p>
      <div className={styles.messageBody}>{children}</div>
    </div>
  );
}
