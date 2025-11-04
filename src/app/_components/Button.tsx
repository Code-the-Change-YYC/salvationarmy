"use client";

import { Button as MantineButton } from "@mantine/core";
import type { ReactNode } from "react";
import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary" | "icon";

export interface ButtonProps {
  text?: string;
  variant?: ButtonVariant;
  color?: string;
  width?: string | number;
  height?: string | number;
  fontSize?: string | number;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function Button({
  text,
  variant = "primary",
  color,
  width,
  height,
  fontSize,
  icon,
  onClick,
  disabled = false,
  ariaLabel,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isIconOnly = variant === "icon" || (!text && !!icon);

  // Accessibility enforcement (development only)
  if (isIconOnly && !ariaLabel && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      "Button: icon-only button rendered without `ariaLabel` — provide `ariaLabel` for screen reader accessibility.",
    );
  }

  return (
    <MantineButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant={isPrimary ? "filled" : "outline"}
      leftSection={icon}
      aria-label={ariaLabel}
      classNames={{
        root: disabled
          ? styles.disabledButton
          : isPrimary
            ? styles.primaryButton
            : styles.secondaryButton,
      }}
      styles={{
        root: {
          borderRadius: "8px",
          width: width,
          height: height ?? "30px",
          fontSize: fontSize ?? "12px",
          ...(color && { backgroundColor: color }),
        },
      }}
    >
      {text}
    </MantineButton>
  );
}
