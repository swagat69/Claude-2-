"use client";

import { useId, type ChangeEvent, type ComponentProps, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import { Fieldset, Hint, describedBy, type FieldMeta } from "./Field";
import styles from "./Choices.module.css";

type Preview = "hover" | "focus-visible";

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  icon?: IconName;
  /** A legitimate "Not sure" answer, shown apart from the others (brief A3). */
  notSure?: boolean;
  /** Documentation only. */
  preview?: Preview;
}

type GroupProps = Omit<FieldMeta, "label"> & {
  legend: ReactNode;
  legendStyle?: "label" | "question" | "page-heading";
  name: string;
  options: ChoiceOption[];
  /** Controlled value. Omit and use `defaultValue` for an uncontrolled group. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
};

function checkedProps(optionValue: string, value?: string, defaultValue?: string) {
  return value !== undefined ? { checked: value === optionValue } : { defaultChecked: defaultValue === optionValue };
}

/* -------------------------------------------------------------------------- */
/* Choice cards: single select, the whole card is the target                  */
/* -------------------------------------------------------------------------- */

export function ChoiceCards({
  id,
  legend,
  legendStyle,
  hint,
  error,
  optional,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  required,
  disabled,
  columns = 1,
}: GroupProps & {
  /** Given to the first radio, so an error summary link can focus the group. */
  id?: string;
  columns?: 1 | 2;
}) {
  const main = options.filter((o) => !o.notSure);
  const notSure = options.filter((o) => o.notSure);
  const first = main[0] ?? notSure[0];
  const card = (option: ChoiceOption) => (
    <label key={option.value} className={styles.card} data-preview={option.preview}>
      <input
        id={option === first ? id : undefined}
        type="radio"
        className={styles.native}
        name={name}
        value={option.value}
        required={required}
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onValueChange?.(e.target.value)}
        {...checkedProps(option.value, value, defaultValue)}
      />
      {option.icon ? (
        <span className={styles.cardIcon} aria-hidden="true">
          <Icon name={option.icon} />
        </span>
      ) : null}
      <span className={styles.cardText}>
        <span className={styles.cardLabel}>{option.label}</span>
        {option.description ? <span className={styles.cardDescription}>{option.description}</span> : null}
      </span>
      <span className={styles.radioMark} aria-hidden="true">
        <Icon name="check" size={20} />
      </span>
    </label>
  );
  return (
    <Fieldset legend={legend} legendStyle={legendStyle} hint={hint} error={error} optional={optional}>
      <div className={styles.cards} data-columns={columns}>
        {main.map(card)}
      </div>
      {notSure.length ? (
        <>
          <p className={styles.or}>or</p>
          <div className={styles.cards}>{notSure.map(card)}</div>
        </>
      ) : null}
    </Fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Checkbox                                                                   */
/* -------------------------------------------------------------------------- */

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
  hint?: ReactNode;
  invalid?: boolean;
  preview?: Preview;
};

export function Checkbox({ label, hint, invalid, preview, id, className, ...input }: CheckboxProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = `${inputId}-hint`;
  return (
    <div className={[styles.checkbox, className].filter(Boolean).join(" ")} data-preview={preview}>
      <input
        id={inputId}
        type="checkbox"
        className={styles.checkboxInput}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(hint && hintId)}
        {...input}
      />
      <span className={styles.box} aria-hidden="true">
        <Icon name="check" size={20} />
      </span>
      <label htmlFor={inputId} className={styles.checkboxLabel}>
        {label}
      </label>
      {hint ? (
        <div className={styles.checkboxHint}>
          <Hint id={hintId}>{hint}</Hint>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Segmented: 2–4 short, mutually exclusive options                           */
/* -------------------------------------------------------------------------- */

export function Segmented({
  legend,
  legendStyle,
  hint,
  error,
  optional,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  required,
  disabled,
}: GroupProps) {
  return (
    <Fieldset legend={legend} legendStyle={legendStyle} hint={hint} error={error} optional={optional}>
      <div className={styles.segmented}>
        {options.map((option) => (
          <label key={option.value} className={styles.segment} data-preview={option.preview}>
            <input
              type="radio"
              className={styles.native}
              name={name}
              value={option.value}
              required={required}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onValueChange?.(e.target.value)}
              {...checkedProps(option.value, value, defaultValue)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </Fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Chips: multi-select                                                        */
/* -------------------------------------------------------------------------- */

export function Chips({
  legend,
  legendStyle,
  hint,
  error,
  optional,
  name,
  options,
  values,
  defaultValues,
  onValuesChange,
  disabled,
}: Omit<GroupProps, "value" | "defaultValue" | "onValueChange" | "required"> & {
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
}) {
  const toggle = (option: string, checked: boolean) => {
    const current = values ?? [];
    onValuesChange?.(checked ? [...current, option] : current.filter((v) => v !== option));
  };
  return (
    <Fieldset legend={legend} legendStyle={legendStyle} hint={hint} error={error} optional={optional}>
      <div className={styles.chips}>
        {options.map((option) => (
          <label key={option.value} className={styles.chip} data-preview={option.preview} data-not-sure={option.notSure || undefined}>
            <input
              type="checkbox"
              className={styles.native}
              name={name}
              value={option.value}
              disabled={disabled}
              onChange={(e) => toggle(option.value, e.target.checked)}
              {...(values !== undefined
                ? { checked: values.includes(option.value) }
                : { defaultChecked: defaultValues?.includes(option.value) })}
            />
            <span className={styles.chipMark} aria-hidden="true">
              <Icon name="check" size={20} />
            </span>
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </Fieldset>
  );
}
