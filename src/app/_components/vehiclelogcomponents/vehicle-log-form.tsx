"use client";

import { Box, Divider, Stack, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import classes from "./vehicle-log-form.module.scss";

interface VehicleLogFormProps {
  date: string;
  setDate: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
  departureTime: string;
  setDepartureTime: (value: string) => void;
  arrivalTime: string;
  setArrivalTime: (value: string) => void;
  odometerStart: string;
  setOdometerStart: (value: string) => void;
  odometerEnd: string;
  setOdometerEnd: (value: string) => void;
  driver: string;
  setDriver: (value: string) => void;
  errors: Record<string, string>;
}

export const VehicleLogForm = ({
  date,
  setDate,
  destination,
  setDestination,
  departureTime,
  setDepartureTime,
  arrivalTime,
  setArrivalTime,
  odometerStart,
  setOdometerStart,
  odometerEnd,
  setOdometerEnd,
  driver,
  setDriver,
  errors,
}: VehicleLogFormProps) => {
  const now = new Date();

  // Calculate KM driven
  const calculateKmDriven = () => {
    const start = Number.parseFloat(odometerStart);
    const end = Number.parseFloat(odometerEnd);

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
          minDate={now}
          value={date}
          onChange={(value) => setDate(value || "")}
          timePickerProps={{
            withDropdown: true,
            popoverProps: { withinPortal: false },
            format: "12h",
          }}
          clearable
          error={errors.date}
        />
      </div>

      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Destination"
          placeholder="Enter destination address"
          value={destination}
          onChange={(e) => setDestination(e.currentTarget.value)}
          error={errors.destination}
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
            minDate={now}
            value={departureTime}
            onChange={(value) => {
              setDepartureTime(value || "");

              // Reset arrival time if it's invalid
              if (value && arrivalTime && arrivalTime <= value) {
                setArrivalTime("");
              }
            }}
            timePickerProps={{
              withDropdown: true,
              popoverProps: { withinPortal: false },
              format: "12h",
            }}
            clearable
            error={errors.departureTime}
          />
        </div>

        <div className={classes.formRow}>
          <DateTimePicker
            withAsterisk
            label="Arrival Time"
            placeholder="Select arrival time"
            minDate={departureTime || now}
            value={arrivalTime}
            onChange={(value) => setArrivalTime(value || "")}
            disabled={!departureTime}
            timePickerProps={{
              withDropdown: true,
              popoverProps: { withinPortal: false },
              format: "12h",
            }}
            clearable
            error={errors.arrivalTime}
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
            value={odometerStart}
            onChange={(e) => setOdometerStart(e.currentTarget.value)}
            error={errors.odometerStart}
          />
        </div>

        <div className={classes.formRow}>
          <TextInput
            withAsterisk
            label="Odometer End (KM)"
            placeholder="Enter ending odometer reading"
            type="number"
            value={odometerEnd}
            onChange={(e) => setOdometerEnd(e.currentTarget.value)}
            error={errors.odometerEnd}
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
          value={driver}
          onChange={(e) => setDriver(e.currentTarget.value)}
          error={errors.driver}
        />
      </div>
    </Stack>
  );
};
