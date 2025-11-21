"use client";
import { Box, Divider, Select, Stack, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { Organization } from "better-auth/plugins/organization";
import { ALL_ORGANIZATION_ROLES, type OrganizationRole } from "@/types/types";
import classes from "./invite-user-form.module.scss";

interface InviteUserForm {
  email: string;
  organizationRole: OrganizationRole;
  organizationId: string;
}

interface InviteUserFormProps {
  form: UseFormReturnType<InviteUserForm>;
  organizations: Organization[];
}

export const InviteUserForm = ({ form }: InviteUserFormProps) => {
  return (
    <Stack gap="lg">
      <Stack gap="md">
        <Box fw={500} fz="lg">
          User Information
        </Box>
        <div className={classes.formRow}>
          <TextInput
            withAsterisk
            label="Email"
            placeholder="Enter email address"
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
        </div>
      </Stack>
      <Divider />
      <div className={classes.formRow}>
        <Select
          withAsterisk
          label="Organization Role"
          placeholder="Pick an organization role for the user"
          data={ALL_ORGANIZATION_ROLES}
          key={form.key("organizationRole")}
          {...form.getInputProps("organizationRole")}
        />
      </div>
      <div className={classes.formRow}>
        <Select
          withAsterisk
          label="Organization"
          placeholder="Pick an organization to invite the user to"
          data={ALL_ORGANIZATION_ROLES}
          key={form.key("organizationId")}
          {...form.getInputProps("organizationId")}
        />
      </div>
    </Stack>
  );
};
