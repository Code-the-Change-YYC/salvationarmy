"use client";

import { Button as MantineButton } from "@mantine/core";
import type { ReactNode } from "react";
import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps {
  text: string;
  variant?: ButtonVariant;
  color?: string;
  width?: string | number;
  height?: string | number;
  fontSize?: string | number;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

function getButtonStyles(variant: ButtonVariant, disabled: boolean) {
  if (disabled) return styles.disabledButton;
  return variant === "primary" ? styles.primaryButton : styles.secondaryButton;
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
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <MantineButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant={isPrimary ? "filled" : "outline"}
      leftSection={icon}
      classNames={{
        root: getButtonStyles(variant, disabled),
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
