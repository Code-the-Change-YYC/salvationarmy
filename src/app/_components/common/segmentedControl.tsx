"use client";

import { Center, SegmentedControl as MantineSegmentedControl } from "@mantine/core";
import type { SVGProps } from "react";
import styles from "./segmentedControl.module.scss";

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label?: string;
  icon?: React.ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  leftOption: SegmentedControlOption;
  rightOption: SegmentedControlOption;
  value?: T;
  onChange?: (value: T) => void;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  readOnly?: boolean;
  disabled?: boolean;
  hideLabelsOnMobile?: boolean;
}
export function SegmentedControl<T extends string = string>({
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
  hideLabelsOnMobile = false,
}: SegmentedControlProps<T>) {
  const ICON_SIZE = 22;
  const labelClass = hideLabelsOnMobile ? styles.labelHideOnMobile : "";

  const data = [
    {
      value: leftOption.value,
      label: leftOption.icon ? (
        <Center className={styles.center}>
          <div
            className={`${styles.iconWrapper} ${value === leftOption.value ? styles.iconWrapperActive : ""}`}
          >
            <leftOption.icon
              width={ICON_SIZE}
              height={ICON_SIZE}
              className={`${styles.icon} ${value === leftOption.value ? styles.iconActive : ""}`}
            />
          </div>
          <span className={labelClass}>{leftOption.label}</span>
        </Center>
      ) : (
        <span className={labelClass}>{leftOption.label}</span>
      ),
      disabled: leftOption.disabled,
    },
    {
      value: rightOption.value,
      label: rightOption.icon ? (
        <Center className={styles.center}>
          <div
            className={`${styles.iconWrapper} ${value === rightOption.value ? styles.iconWrapperActive : ""}`}
          >
            <rightOption.icon
              width={ICON_SIZE}
              height={ICON_SIZE}
              className={`${styles.icon} ${value === rightOption.value ? styles.iconActive : ""}`}
            />
          </div>
          <span className={labelClass}>{rightOption.label}</span>
        </Center>
      ) : (
        <span className={labelClass}>{rightOption.label}</span>
      ),
      disabled: rightOption.disabled,
    },
  ];

  // Cast to T for the external onChange consumer because Mantine has it's own handle change type casted to a string
  const handleChange = (v: string) => {
    if (onChange) onChange(v as T);
  };

  return (
    <MantineSegmentedControl
      data={data}
      value={value}
      onChange={handleChange}
      color={color}
      size={size}
      fullWidth={fullWidth}
      orientation="horizontal"
      transitionDuration={transitionDuration}
      transitionTimingFunction={transitionTimingFunction}
      readOnly={readOnly}
      disabled={disabled}
      radius="xl"
      classNames={{
        root: styles.root,
        control: styles.control,
        indicator: styles.indicator,
      }}
    />
  );
}

export default SegmentedControl;
