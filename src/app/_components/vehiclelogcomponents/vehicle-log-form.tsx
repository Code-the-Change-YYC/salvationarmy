"use client";

import { Stack, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import classes from "./vehicle-log-form.module.scss";

interface VehicleLogForm {
  date: string;
  travelLocation: string;
  departureTime: string;
  arrivalTime: string;
  odometerStart: string;
  odometerEnd: string;
  kilometersDriven: string;
  driverName: string;
}

interface VehicleLogFormProps {
  form: UseFormReturnType<VehicleLogForm>;
}

export const VehicleLogForm = ({ form }: VehicleLogFormProps) => {
  const now = new Date();

  return (
    <Stack gap="md">
      <div className={classes.formRow}>
        <DateTimePicker
          withAsterisk
          label="Date"
          placeholder="Select date"
          minDate={now}
          value={form.values.date}
          onChange={(value) => form.setFieldValue("date", value || "")}
          clearable
        />
      </div>
      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Travel Location"
          placeholder="Enter destination"
          key={form.key("travelLocation")}
          {...form.getInputProps("travelLocation")}
        />
      </div>
      <div className={classes.formRow}>
        <DateTimePicker
          withAsterisk
          label="Departure Time"
          placeholder="Select departure time"
          minDate={now}
          value={form.values.departureTime}
          onChange={(value) => {
            form.setFieldValue("departureTime", value || "");
            // Reset arrival time if it's invalid
            form.setFieldValue("arrivalTime", "");
          }}
          timePickerProps={{
            withDropdown: true,
            popoverProps: { withinPortal: false },
            format: "12h",
          }}
          clearable
        />
      </div>
      <div className={classes.formRow}>
        <DateTimePicker
          withAsterisk
          label="Arrival Time"
          placeholder="Select arrival time"
          minDate={form.values.departureTime ? new Date(form.values.departureTime) : now}
          value={form.values.arrivalTime}
          onChange={(value) => form.setFieldValue("arrivalTime", value || "")}
          disabled={!form.values.departureTime}
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
          label="Odometer Start"
          placeholder="Enter starting odometer value"
          key={form.key("odometerStart")}
          {...form.getInputProps("odometerStart")}
        />
      </div>
      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Odometer End"
          placeholder="Enter ending odometer value"
          key={form.key("odometerEnd")}
          {...form.getInputProps("odometerEnd")}
        />
      </div>
      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Kilometers Driven"
          placeholder="Enter KM driven"
          key={form.key("kilometersDriven")}
          {...form.getInputProps("kilometersDriven")}
        />
      </div>
      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Driver Name"
          placeholder="Enter name"
          key={form.key("driverName")}
          {...form.getInputProps("driverName")}
        />
      </div>
    </Stack>
  );
};
