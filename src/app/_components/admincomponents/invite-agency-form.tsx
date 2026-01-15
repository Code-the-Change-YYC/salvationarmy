"use client";
import { Box, Stack, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

interface InviteAgencyForm {
  name: string;
  slug: string;
}

interface InviteAgencyFormProps {
  form: UseFormReturnType<InviteAgencyForm>;
}

export const InviteAgencyForm = ({ form }: InviteAgencyFormProps) => {
  return (
    <Stack gap="xl">
      <Stack gap="md">
        <Box fw={600} fz="lg" c="#8B2635">
          Agency Information
        </Box>
        <TextInput
          withAsterisk
          label="Agency Name"
          placeholder="Enter agency name"
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput
          withAsterisk
          label="Agency Slug (ex: my-org)"
          placeholder="Enter agency slug"
          key={form.key("slug")}
          {...form.getInputProps("slug")}
        />
      </Stack>
    </Stack>
  );
};
