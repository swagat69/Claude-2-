import { useId, type ReactNode } from "react";
import { Icon } from "@/components/icon/Icon";
import styles from "./Field.module.css";

/** Shared by every labelled control (brief §7 field-level specification). */
export interface FieldMeta {
  /** Always visible; placeholders are never labels. */
  label: ReactNode;
  hint?: ReactNode;
  /** Extra help after the hint, such as a "Why we ask" disclosure. Not part of the accessible description. */
  help?: ReactNode;
  /** Says how to fix the problem, e.g. "Enter your email in the format name@example.com". */
  error?: string | null;
  /** Marks the field "(optional)". Required is the default and is not labelled. */
  optional?: boolean;
}

export function useFieldIds(id?: string) {
  const generated = useId();
  const base = id ?? generated;
  return { inputId: base, hintId: `${base}-hint`, errorId: `${base}-error` };
}

/** Joins the ids of whichever descriptions are present; pass `condition && id` for each. */
export function describedBy(...ids: unknown[]): string | undefined {
  const present = ids.filter((id): id is string => typeof id === "string" && id.length > 0);
  return present.length ? present.join(" ") : undefined;
}

export function Label({
  htmlFor,
  optional,
  labelStyle = "label",
  children,
}: {
  htmlFor: string;
  optional?: boolean;
  /** "question" matches a question legend, for a select asked as a question. */
  labelStyle?: "label" | "question";
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={styles.label} data-style={labelStyle === "question" ? "question" : undefined}>
      {children}
      {optional ? <span className={styles.optional}> (optional)</span> : null}
    </label>
  );
}

export function Hint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className={styles.hint}>
      {children}
    </p>
  );
}

export function ErrorMessage({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className={styles.error}>
      <Icon name="alert-circle" size={20} />
      <span>
        <span className="visually-hidden">Error: </span>
        {children}
      </span>
    </p>
  );
}

type LegendStyle = "label" | "question" | "page-heading";

/**
 * Groups radios, checkboxes, chips or related inputs under one legend.
 * `legendStyle="page-heading"` puts the page's h1 inside the legend, for a
 * one-question page (the GOV.UK pattern the brief cites in §2).
 */
export function Fieldset({
  legend,
  legendStyle = "label",
  hint,
  help,
  error,
  optional,
  id,
  className,
  children,
}: Omit<FieldMeta, "label"> & {
  legend: ReactNode;
  legendStyle?: LegendStyle;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const { hintId, errorId } = useFieldIds(id);
  const optionalMark = optional ? <span className={styles.optional}> (optional)</span> : null;
  return (
    <fieldset
      id={id}
      className={[styles.fieldset, className].filter(Boolean).join(" ")}
      data-invalid={error ? true : undefined}
      aria-describedby={describedBy(hint && hintId, error && errorId)}
    >
      <legend className={styles.legend} data-style={legendStyle}>
        {legendStyle === "page-heading" ? (
          <h1 className="type-h1" tabIndex={-1}>
            {legend}
            {optionalMark}
          </h1>
        ) : (
          <>
            {legend}
            {optionalMark}
          </>
        )}
      </legend>
      {hint ? <Hint id={hintId}>{hint}</Hint> : null}
      {help}
      {error ? <ErrorMessage id={errorId}>{error}</ErrorMessage> : null}
      {children}
    </fieldset>
  );
}
