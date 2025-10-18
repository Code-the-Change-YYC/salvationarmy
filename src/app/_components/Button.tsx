"use client";

import { Button as MantineButton } from "@mantine/core";
import type { ReactNode } from "react";

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
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const defaultColor = isPrimary ? "#A03145" : "#BFBFBF";

  return (
    <MantineButton
      type="button"
      onClick={onClick}
      variant={isPrimary ? "filled" : "outline"}
      color={color ?? defaultColor}
      c={isPrimary ? "white" : "black"}
      leftSection={icon}
      styles={{
        root: {
          borderRadius: "8px",
          width: width,
          height: height ?? "30px",
          fontSize: fontSize ?? "12px",
        },
      }}
    >
      {text}
    </MantineButton>
  );
}
