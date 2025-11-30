"use client";

import type { DateTimePickerProps } from "@mantine/dates";
import { DateTimePicker } from "@mantine/dates";
import styles from "./DatePicker.module.scss";

export interface DatePickerProps extends Omit<DateTimePickerProps, "value" | "onChange"> {
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
}

/**
 * DatePicker component
 *
 * Pick a date and time, returns an iso string value
 *
 * @example
 * const [date, setDate] = useState<string | null>(null);
 *
 * <DatePicker
 *   label="Departure Time"
 *   value={date}
 *   onChange={setDate}
 * />
 *
 */
export default function DatePicker({
  label,
  placeholder,
  required = false,
  error,
  valueFormat = "DD MMM YYYY hh:mm A",
  value,
  onChange,
  ...props
}: DatePickerProps) {
  // Convert ISO string to Date object for Mantine
  const mantineValue = value ? new Date(value) : null;

  // Convert to iso string
  const handleChange = (mantineValue: string | null) => {
    if (!mantineValue) {
      onChange?.(null);
      return;
    }

    const isoString = new Date(mantineValue).toISOString();
    onChange?.(isoString);
  };

  return (
    <div className={styles.formRow}>
      <DateTimePicker
        label={label}
        placeholder={placeholder}
        withAsterisk={required}
        valueFormat={valueFormat}
        error={error}
        value={mantineValue}
        onChange={handleChange}
        timePickerProps={{
          withDropdown: true,
          popoverProps: { withinPortal: false },
        }}
        {...props}
      />
    </div>
  );
}
