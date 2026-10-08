"use client";

import type { FocusEvent } from "react";
import { formatAmount, formatSgPhone, parseAmount } from "@/lib/format";
import { TextField, type TextFieldProps } from "./TextField";

type FieldProps = Omit<TextFieldProps, "type" | "inputMode" | "prefix">;

/** Tidies the typed value on blur, never while the person is typing. */
function tidyOnBlur(format: (value: string) => string, onBlur?: FieldProps["onBlur"]) {
  return (event: FocusEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const next = format(input.value);
    if (next !== input.value) {
      // Write through the native setter so React's controlled-input tracking sees the change.
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, next);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    onBlur?.(event);
  };
}

function tidyAmount(value: string): string {
  const amount = parseAmount(value);
  return amount === null || Number.isNaN(amount) ? value : formatAmount(amount);
}

/** S$ amount. Accepts "25000", "25,000" or "S$25,000"; an empty field means unanswered, not zero. */
export function CurrencyField({ onBlur, width = "medium", ...props }: FieldProps) {
  return (
    <TextField
      {...props}
      width={width}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      prefix="S$"
      onBlur={tidyOnBlur(tidyAmount, onBlur)}
    />
  );
}

/** Singapore mobile with a fixed +65. Pasting "+65 9123 4567" works too. */
export function PhoneField({ onBlur, width = "medium", ...props }: FieldProps) {
  return (
    <TextField
      {...props}
      width={width}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      prefix="+65"
      onBlur={tidyOnBlur(formatSgPhone, onBlur)}
    />
  );
}

export function EmailField(props: FieldProps) {
  return (
    <TextField
      {...props}
      type="email"
      inputMode="email"
      autoComplete="email"
      autoCapitalize="none"
      spellCheck={false}
    />
  );
}
