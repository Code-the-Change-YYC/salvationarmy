"use client";

import { Button, Divider, Group, Stack, TextInput, Textarea, Title } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import classes from "./agency-form.module.scss";

interface AgencyBookingForm {
  residentName: string;
  contactInfo: string;
  additionalInfo: string;
  transportDateTime: string;
  purpose: string;
  destinationAddress: string;
}

export default function AgencyForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      residentName: "",
      contactInfo: "",
      additionalInfo: "",
      transportDateTime: "",
      purpose: "",
      destinationAddress: "",
    },

    validate: {
      residentName: (value) => (value.trim().length > 0 ? null : "Resident name is required"),
      contactInfo: (value) => (value.trim().length > 0 ? null : "Contact info is required"),
      transportDateTime: (value) => (value.trim().length > 0 ? null : "Date and time is required"),
      purpose: (value) => (value.trim().length > 0 ? null : "Purpose is required"),
      destinationAddress: (value) =>
        value.trim().length > 0 ? null : "Destination address is required",
    },
  });

  function handleSubmit(values: AgencyBookingForm) {
    console.log(values);
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Title order={2}>Add a booking</Title>

        {/* Personal Information Section */}
        <Stack gap="md">
          <Title order={3} size="h4">
            Personal Information
          </Title>

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
          <Title order={3} size="h4">
            Logistics
          </Title>

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
            />
          </div>
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button type="button">Cancel</Button>
          <Button type="submit">Save Booking</Button>
        </Group>
      </Stack>
    </form>
  );
}
