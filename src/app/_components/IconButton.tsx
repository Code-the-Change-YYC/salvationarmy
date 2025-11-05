"use client";

import { ActionIcon } from "@mantine/core";
import type { ReactNode } from "react";
import styles from "./Button.module.scss";

export interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  ariaLabel: string; // required for accessibility
  color?: string;
  width?: string | number;
  height?: string | number;
  size?: "sm" | "md" | "lg" | number;
  variant?: "filled" | "outline" | "transparent";
  disabled?: boolean;
}

export default function IconButton({
  icon,
  onClick,
  ariaLabel,
  color,
  width,
  height,
  size = "md",
  variant = "filled",
  disabled = false,
}: IconButtonProps) {
  return (
    <ActionIcon
      onClick={onClick}
      aria-label={ariaLabel}
      color={color ?? "var(--color-primary)"}
      variant={variant}
      size={size}
      disabled={disabled}
      className={variant === "filled" ? styles.iconButton : undefined}
      style={{
        width: width,
        height: height,
      }}
    >
      {icon}
    </ActionIcon>
  );
}
