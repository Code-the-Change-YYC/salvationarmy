"use client";

import { Box, Divider, Stack, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import classes from "./vehicle-log-form.module.scss";

interface VehicleLogFormData {
  date: string | null;
  destination: string;
  departureTime: string | null;
  arrivalTime: string | null;
  odometerStart: string;
  odometerEnd: string;
  driver: string;
  vehicle: string;
}

interface VehicleLogFormProps {
  form: UseFormReturnType<VehicleLogFormData>;
}

export const VehicleLogForm = ({ form }: VehicleLogFormProps) => {
  const now = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(now.getDate() - 90);

  // Calculate KM driven
  const calculateKmDriven = () => {
    const start = Number.parseFloat(form.values.odometerStart);
    const end = Number.parseFloat(form.values.odometerEnd);

    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      return (end - start).toString();
    }
    return "";
  };

  return (
    <Stack gap="lg">
      <div className={classes.formRow}>
        <DateTimePicker
          withAsterisk
          label="Date"
          placeholder="Select date"
          minDate={ninetyDaysAgo}
          maxDate={now}
          key={form.key("date")}
          {...form.getInputProps("date")}
          onBlur={() => form.validateField("date")}
          timePickerProps={{
            withDropdown: true,
            popoverProps: { withinPortal: false },
            format: "12h",
          }}
          clearable
        />
      </div>

      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Destination"
          placeholder="Enter destination address"
          key={form.key("destination")}
          {...form.getInputProps("destination")}
        />
      </div>

      <Divider />

      <Stack gap="md">
        <Box fw={500} fz="lg">
          Trip Times
        </Box>

        <div className={classes.formRow}>
          <DateTimePicker
            withAsterisk
            label="Departure Time"
            placeholder="Select departure time"
            minDate={ninetyDaysAgo}
            maxDate={now}
            value={form.values.departureTime}
            onChange={(value) => {
              form.setFieldValue("departureTime", value);

              // Reset arrival time if it's invalid
              if (value && form.values.arrivalTime && form.values.arrivalTime <= value) {
                form.setFieldValue("arrivalTime", null);
              }
            }}
            onBlur={() => form.validateField("departureTime")}
            timePickerProps={{
              withDropdown: true,
              popoverProps: { withinPortal: false },
              format: "12h",
            }}
            clearable
            error={form.errors.departureTime}
          />
        </div>

        <div className={classes.formRow}>
          <DateTimePicker
            withAsterisk
            label="Arrival Time"
            placeholder="Select arrival time"
            minDate={form.values.departureTime || ninetyDaysAgo}
            maxDate={now}
            disabled={!form.values.departureTime}
            key={form.key("arrivalTime")}
            {...form.getInputProps("arrivalTime")}
            onBlur={() => form.validateField("arrivalTime")}
            timePickerProps={{
              withDropdown: true,
              popoverProps: { withinPortal: false },
              format: "12h",
            }}
            clearable
          />
        </div>
      </Stack>

      <Divider />

      <Stack gap="md">
        <Box fw={500} fz="lg">
          Odometer Readings
        </Box>

        <div className={classes.formRow}>
          <TextInput
            withAsterisk
            label="Odometer Start (KM)"
            placeholder="Enter starting odometer reading"
            type="number"
            key={form.key("odometerStart")}
            {...form.getInputProps("odometerStart")}
          />
        </div>

        <div className={classes.formRow}>
          <TextInput
            withAsterisk
            label="Odometer End (KM)"
            placeholder="Enter ending odometer reading"
            type="number"
            key={form.key("odometerEnd")}
            {...form.getInputProps("odometerEnd")}
          />
        </div>

        <div className={classes.formRow}>
          <TextInput
            label="KM Driven"
            placeholder="Calculated automatically"
            value={calculateKmDriven()}
            disabled
          />
        </div>
      </Stack>

      <Divider />

      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Driver"
          placeholder="Enter driver name"
          key={form.key("driver")}
          {...form.getInputProps("driver")}
        />
      </div>

      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Vehicle"
          placeholder="Enter vehicle name"
          key={form.key("vehicle")}
          {...form.getInputProps("vehicle")}
        />
      </div>
    </Stack>
  );
};
