"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "accent";
export type ButtonSize = "large" | "compact";
/** Documentation only: render a pointer/keyboard state statically for state matrices. */
export type PreviewState = "hover" | "pressed" | "focus-visible";

interface StyleProps {
  /** `accent` (lime) is only for forest/dark surfaces. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconStart?: IconName;
  iconEnd?: IconName;
  preview?: PreviewState;
  children: ReactNode;
}

function classNames(
  { variant = "primary", size = "large", fullWidth }: Pick<StyleProps, "variant" | "size" | "fullWidth">,
  extra?: string,
) {
  return [styles.button, styles[variant], styles[size], fullWidth && styles.full, extra].filter(Boolean).join(" ");
}

function Content({ iconStart, iconEnd, busy, children }: Pick<StyleProps, "iconStart" | "iconEnd" | "children"> & { busy?: boolean }) {
  return (
    <>
      {busy ? <span className={styles.spinner} aria-hidden="true" /> : iconStart ? <Icon name={iconStart} size={20} /> : null}
      <span className={styles.label}>{children}</span>
      {iconEnd && !busy ? <Icon name={iconEnd} size={20} /> : null}
    </>
  );
}

type ButtonProps = StyleProps &
  Omit<ComponentProps<"button">, "children"> & {
    /**
     * Request in flight. The button keeps focus and its label but ignores
     * further presses, so a double tap can't submit twice (brief §13).
     */
    busy?: boolean;
  };

/** Button text always names the next action: "Continue to your situation", not "Next". */
export function Button({
  variant,
  size,
  fullWidth,
  iconStart,
  iconEnd,
  preview,
  busy,
  className,
  type = "button",
  onClick,
  children,
  ...rest
}: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (busy) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  return (
    <button
      type={type}
      className={classNames({ variant, size, fullWidth }, className)}
      data-preview={preview}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      onClick={handleClick}
      {...rest}
    >
      <Content iconStart={iconStart} iconEnd={iconEnd} busy={busy}>
        {children}
      </Content>
    </button>
  );
}

type ButtonLinkProps = StyleProps & Omit<ComponentProps<typeof Link>, "children">;

/** Navigation that looks like a button, e.g. the "Find my next step" CTA. */
export function ButtonLink({ variant, size, fullWidth, iconStart, iconEnd, preview, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={classNames({ variant, size, fullWidth }, className)} data-preview={preview} {...rest}>
      <Content iconStart={iconStart} iconEnd={iconEnd}>
        {children}
      </Content>
    </Link>
  );
}
