"use client";

import { Box, Divider, Stack, Textarea, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import classes from "./agency-form.module.scss";

interface AgencyBookingForm {
  residentName: string;
  contactInfo: string;
  additionalInfo: string;
  transportDateTime: string;
  purpose: string;
  destinationAddress: string;
}

interface AgencyFormProps {
  form: UseFormReturnType<AgencyBookingForm>;
  destinationAddressRef: React.RefObject<HTMLInputElement | null>;
}

export const AgencyForm = ({ form, destinationAddressRef }: AgencyFormProps) => {
  return (
    <Stack gap="lg">
      {/* Personal Information Section */}
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
            label="Contact Information"
            placeholder="Enter a phone number or email address"
            key={form.key("contactInfo")}
            {...form.getInputProps("contactInfo")}
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

      {/* Logistics Section */}
      <Stack gap="md">
        <Box fw={500} fz="lg">
          Logistics
        </Box>

        <div className={classes.formRow}>
          <DateTimePicker
            withAsterisk
            label="Date and time of transport"
            placeholder="Select date and time"
            valueFormat="DD MMM YYYY hh:mm A"
            key={form.key("transportDateTime")}
            {...form.getInputProps("transportDateTime")}
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
