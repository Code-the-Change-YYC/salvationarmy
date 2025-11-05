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
  transparent?: boolean;
  disabled?: boolean;
}

function getButtonStyles(variant: ButtonVariant, disabled: boolean, transparent: boolean) {
  const classes = [];

  if (disabled) {
    classes.push(styles.disabledButton);
  } else {
    classes.push(variant === "primary" ? styles.primaryButton : styles.secondaryButton);
  }

  if (transparent) {
    classes.push(styles.transparentButton);
  }

  return classes.join(" ");
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
  transparent = false,
  disabled = false,
}: ButtonProps) {
  return (
    <MantineButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant={transparent ? "transparent" : "filled"}
      leftSection={icon}
      classNames={{
        root: getButtonStyles(variant, disabled, transparent),
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
