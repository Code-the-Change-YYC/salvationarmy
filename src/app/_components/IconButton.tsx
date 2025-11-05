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
  transparent?: boolean;
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
  transparent = false,
  disabled = false,
}: IconButtonProps) {
  const getIconButtonClass = () => {
    const classes = [styles.iconButton];
    if (disabled) {
      classes.push(styles.disabledButton);
    }
    if (transparent) {
      classes.push(styles.transparentButton);
    }
    return classes.join(" ");
  };

  return (
    <ActionIcon
      onClick={onClick}
      aria-label={ariaLabel}
      color={color}
      variant={transparent ? "transparent" : "filled"}
      size={size}
      disabled={disabled}
      className={getIconButtonClass()}
      style={{
        width: width,
        height: height,
      }}
    >
      {icon}
    </ActionIcon>
  );
}
