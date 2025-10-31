"use client";

import { Center, SegmentedControl as MantineSegmentedControl } from "@mantine/core";
import type React from "react";

export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  leftOption: SegmentedControlOption;
  rightOption: SegmentedControlOption;
  value?: string;
  onChange?: (value: string) => void;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  leftOption,
  rightOption,
  value,
  onChange,
  color = "black",
  size = "md",
  fullWidth = false,
  transitionDuration = 200,
  transitionTimingFunction = "ease",
  readOnly = false,
  disabled = false,
}) => {
  const data = [
    {
      value: leftOption.value,
      label: leftOption.icon ? (
        <Center style={{ gap: 8 }}>
          <div
            style={{
              color: value === leftOption.value ? "white" : "inherit",
            }}
          >
            <leftOption.icon
              size={16}
              style={{
                color: value === leftOption.value ? "white" : "inherit",
                filter: value === leftOption.value ? "brightness(0) invert(1)" : "none",
              }}
            />
          </div>
          <span>{leftOption.label}</span>
        </Center>
      ) : (
        leftOption.label
      ),
      disabled: leftOption.disabled,
    },
    {
      value: rightOption.value,
      label: rightOption.icon ? (
        <Center style={{ gap: 8 }}>
          <div
            style={{
              color: value === rightOption.value ? "white" : "inherit",
            }}
          >
            <rightOption.icon
              size={16}
              style={{
                color: value === rightOption.value ? "white" : "inherit",
                filter: value === rightOption.value ? "brightness(0) invert(1)" : "none",
              }}
            />
          </div>
          <span>{rightOption.label}</span>
        </Center>
      ) : (
        rightOption.label
      ),
      disabled: rightOption.disabled,
    },
  ];

  return (
    <MantineSegmentedControl
      data={data}
      value={value}
      onChange={onChange}
      color={color}
      size={size}
      fullWidth={fullWidth}
      orientation="horizontal"
      transitionDuration={transitionDuration}
      transitionTimingFunction={transitionTimingFunction}
      readOnly={readOnly}
      disabled={disabled}
      radius="xl"
      styles={{
        root: {
          borderRadius: "24px",
        },
        control: {
          borderRadius: "24px",
        },
        indicator: {
          borderRadius: "24px",
        },
      }}
    />
  );
};

export default SegmentedControl;
