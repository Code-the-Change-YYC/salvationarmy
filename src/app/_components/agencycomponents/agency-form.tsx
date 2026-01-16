"use client";

import { Box, Divider, Stack, Textarea, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import dayjs from "dayjs";
import classes from "./agency-form.module.scss";

interface AgencyBookingForm {
  title: string;
  residentName: string;
  phoneNumber: string;
  additionalInfo: string;
  startTime: string;
  endTime: string;
  purpose: string;
  pickupAddress: string;
  destinationAddress: string;
}

interface AgencyFormProps {
  form: UseFormReturnType<AgencyBookingForm>;
  destinationAddressRef: React.RefObject<HTMLInputElement | null>;
}

export const AgencyForm = ({ form, destinationAddressRef }: AgencyFormProps) => {
  const now = new Date();

  return (
    <Stack gap="lg">
      <div className={classes.formRow}>
        <TextInput
          withAsterisk
          label="Booking Name"
          placeholder="Enter name"
          key={form.key("title")}
          {...form.getInputProps("title")}
        />
      </div>
      <Divider />
      <Stack gap="md">
        <Box fw={500} fz="lg">
          Personal Information
        </Box>
        <div className={classes.formRow}>
          <TextInput
            withAsterisk
            label="Resident Name"
            placeholder="Enter name"
            key={form.key("residentName")}
            {...form.getInputProps("residentName")}
          />
        </div>

        <div className={classes.formRow}>
          <TextInput
            withAsterisk
            label="Phone Number"
            placeholder="Enter phone number"
            key={form.key("phoneNumber")}
            {...form.getInputProps("phoneNumber")}
          />
        </div>

        <div className={classes.formRow}>
          <Textarea
            label="Additional Information"
            placeholder="Enter any pets, personal belongings, support required entering / exiting vehicle, etc."
            key={form.key("additionalInfo")}
            {...form.getInputProps("additionalInfo")}
            minRows={3}
          />
        </div>
      </Stack>

      <Divider />

      <Stack gap="md">
        <Box fw={500} fz="lg">
          Logistics
        </Box>

        <div className={classes.formRow}>
          <DateTimePicker
            withAsterisk
            label="Start time"
            placeholder="Select start date and time"
            minDate={now}
            valueFormat="MMM DD, YYYY hh:mm A"
            value={form.values.startTime ? new Date(form.values.startTime) : null}
            onChange={(value) => {
              if (!value) {
                form.setFieldValue("startTime", "");
                return;
              }
              const isoString = dayjs(value).toISOString();
              console.log("Start Time - parsed:", isoString);
              console.log("Start Time - after parsing:", new Date(isoString));
              console.log(
                "Start Time - show local time:",
                dayjs(isoString).format("YYYY-MM-DD hh:mm A"),
              );
              form.setFieldValue("startTime", isoString);

              if (isoString && form.values.endTime && form.values.endTime <= isoString) {
                // to reset the end time if it's invalid
                form.setFieldValue("endTime", "");
              }
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
            label="End time"
            placeholder="Select end date and time"
            minDate={form.values.startTime ? new Date(form.values.startTime) : now}
            valueFormat="MMM DD, YYYY hh:mm A"
            value={form.values.endTime ? new Date(form.values.endTime) : null}
            onChange={(value) => {
              if (!value) {
                form.setFieldValue("endTime", "");
                return;
              }
              const isoString = dayjs(value).toISOString();
              console.log("End Time - parsed:", isoString);
              console.log("End Time - after parsing:", new Date(isoString));
              console.log(
                "End Time - show local time:",
                dayjs(isoString).format("YYYY-MM-DD hh:mm A"),
              );
              form.setFieldValue("endTime", isoString);
            }}
            disabled={!form.values.startTime}
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
            label="Purpose of transport"
            placeholder="Enter purpose of transport"
            key={form.key("purpose")}
            {...form.getInputProps("purpose")}
          />
        </div>
        <div className={classes.formRow}>
          <TextInput
            withAsterisk
            label="Pickup Address"
            placeholder="Enter address"
            key={form.key("pickupAddress")}
            {...form.getInputProps("pickupAddress")}
          />
        </div>
        <div className={classes.formRow}>
          <TextInput
            withAsterisk
            label="Destination Address"
            placeholder="Enter address"
            key={form.key("destinationAddress")}
            {...form.getInputProps("destinationAddress")}
            ref={destinationAddressRef}
          />
        </div>
      </Stack>
    </Stack>
  );
};
