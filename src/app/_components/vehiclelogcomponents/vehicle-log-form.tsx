"use client";

import { Stack, TextInput } from "@mantine/core";
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
  return (
    <Stack gap="md">
      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Date"
          placeholder="Enter date"
          key={form.key("date")}
          {...form.getInputProps("date")}
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
        <TextInput
          withAsterisk
          label="Departure Time"
          placeholder="Enter departure time"
          key={form.key("departureTime")}
          {...form.getInputProps("departureTime")}
        />
      </div>
      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Arrival Time"
          placeholder="Enter arrival time"
          key={form.key("arrivalTime")}
          {...form.getInputProps("arrivalTime")}
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
