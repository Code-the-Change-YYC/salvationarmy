"use client";

import type { DateTimePickerProps } from "@mantine/dates";
import { DateTimePicker } from "@mantine/dates";
import styles from "./DatePicker.module.scss";

export interface DatePickerProps extends Omit<DateTimePickerProps, "classNames"> {
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export default function DatePicker({
  label,
  placeholder,
  required = false,
  error,
  valueFormat = "DD MMM YYYY hh:mm A",
  ...props
}: DatePickerProps) {
  return (
    <div className={styles.formRow}>
      <DateTimePicker
        label={label}
        placeholder={placeholder}
        withAsterisk={required}
        valueFormat={valueFormat}
        error={error}
        {...props}
      />
    </div>
  );
}
