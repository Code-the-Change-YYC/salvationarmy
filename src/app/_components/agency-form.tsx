"use client";

import { Button, Divider, Group, Stack, TextInput, Textarea, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

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

  function handleSubmit(values: typeof form.values) {
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

          <TextInput
            withAsterisk
            label="Resident Name"
            placeholder="Enter name"
            key={form.key("residentName")}
            {...form.getInputProps("residentName")}
          />

          <TextInput
            withAsterisk
            label="Contact Information"
            description="Phone number or email address"
            placeholder="Enter phone number or email address"
            key={form.key("contactInfo")}
            {...form.getInputProps("contactInfo")}
          />

          <Textarea
            label="Additional Information"
            description="Any pets, personal belongings, support required entering / exiting vehicle, etc."
            key={form.key("additionalInfo")}
            {...form.getInputProps("additionalInfo")}
            minRows={3}
          />
        </Stack>

        <Divider />

        {/* Logistics Section */}
        <Stack gap="md">
          <Title order={3} size="h4">
            Logistics
          </Title>

          <TextInput
            withAsterisk
            label="Date and time of transport"
            placeholder="YYYY-MM-DD HH:MM"
            key={form.key("transportDateTime")}
            {...form.getInputProps("transportDateTime")}
          />

          <TextInput
            withAsterisk
            label="Purpose"
            placeholder="Enter purpose of transport"
            key={form.key("purpose")}
            {...form.getInputProps("purpose")}
          />

          <TextInput
            withAsterisk
            label="Destination Address"
            placeholder="Enter address"
            key={form.key("destinationAddress")}
            {...form.getInputProps("destinationAddress")}
          />
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button type="button">Cancel</Button>
          <Button type="submit">Save Booking</Button>
        </Group>
      </Stack>
    </form>
  );
}
