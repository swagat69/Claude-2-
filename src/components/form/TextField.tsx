import type { ComponentProps, ReactNode } from "react";
import { Icon } from "@/components/icon/Icon";
import { ErrorMessage, Hint, Label, describedBy, useFieldIds, type FieldMeta } from "./Field";
import styles from "./Field.module.css";

export type TextFieldProps = FieldMeta &
  Omit<ComponentProps<"input">, "prefix" | "size"> & {
    /** Read before the value, e.g. "S$" or "+65". Announced with the field. */
    prefix?: string;
    /** Unit after the value, e.g. "months". */
    suffix?: string;
    /** Shows a verified badge, e.g. "Verified" once an email is confirmed. */
    verified?: string;
    /** Match the width to the expected answer (brief §7). */
    width?: "full" | "medium" | "short";
    /** Documentation only. */
    preview?: "hover" | "focus";
  };

export function TextField({
  label,
  hint,
  help,
  error,
  optional,
  prefix,
  suffix,
  verified,
  width = "full",
  preview,
  id,
  className,
  disabled,
  ...input
}: TextFieldProps) {
  const { inputId, hintId, errorId } = useFieldIds(id);
  const prefixId = `${inputId}-prefix`;
  const suffixId = `${inputId}-suffix`;
  const verifiedId = `${inputId}-verified`;
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")} data-invalid={error ? true : undefined}>
      <Label htmlFor={inputId} optional={optional}>
        {label}
      </Label>
      {hint ? <Hint id={hintId}>{hint}</Hint> : null}
      {help}
      {error ? <ErrorMessage id={errorId}>{error}</ErrorMessage> : null}
      <div
        className={styles.control}
        data-width={width}
        data-preview={preview}
        data-disabled={disabled || undefined}
        data-verified={verified && !error ? true : undefined}
      >
        {prefix ? (
          <span id={prefixId} className={styles.affix}>
            {prefix}
          </span>
        ) : null}
        <input
          id={inputId}
          className={styles.input}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(
            prefix && prefixId,
            suffix && suffixId,
            hint && hintId,
            error && errorId,
            verified && verifiedId,
          )}
          {...input}
        />
        {suffix ? (
          <span id={suffixId} className={styles.suffix}>
            {suffix}
          </span>
        ) : null}
        {verified && !error ? (
          <span id={verifiedId} className={styles.verified}>
            <Icon name="check-circle" size={20} />
            {verified}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export type SelectProps = FieldMeta &
  Omit<ComponentProps<"select">, "size"> & {
    options: { value: string; label: string }[];
    /** First, empty option. Shown until the person chooses. */
    placeholder?: string;
    width?: "full" | "medium" | "short";
    preview?: "hover" | "focus";
    labelStyle?: "label" | "question";
    children?: ReactNode;
  };

/** Native select: the most robust option on phones and with screen readers (brief §13, family 04). */
export function Select({
  label,
  hint,
  help,
  error,
  optional,
  options,
  placeholder = "Select an option",
  width = "full",
  preview,
  labelStyle,
  id,
  className,
  disabled,
  ...select
}: SelectProps) {
  const { inputId, hintId, errorId } = useFieldIds(id);
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")} data-invalid={error ? true : undefined}>
      <Label htmlFor={inputId} optional={optional} labelStyle={labelStyle}>
        {label}
      </Label>
      {hint ? <Hint id={hintId}>{hint}</Hint> : null}
      {help}
      {error ? <ErrorMessage id={errorId}>{error}</ErrorMessage> : null}
      <div
        className={`${styles.control} ${styles.selectWrap}`}
        data-width={width}
        data-preview={preview}
        data-disabled={disabled || undefined}
      >
        <select
          id={inputId}
          className={`${styles.input} ${styles.select}`}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint && hintId, error && errorId)}
          {...select}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={20} />
      </div>
    </div>
  );
}
