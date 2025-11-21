"use client";
import { Box, Divider, Select, Stack, TextInput, Title } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { Organization } from "@/server/db/auth-schema";
import { ALL_ROLES, Role } from "@/types/types";
import classes from "./invite-user-form.module.scss";

interface InviteUserForm {
  email: string;
  role: Role;
  agencyId: string;
}

interface InviteUserFormProps {
  form: UseFormReturnType<InviteUserForm>;
  organizations: Organization[];
}

export const InviteUserForm = ({ form, organizations }: InviteUserFormProps) => {
  const filteredOrganizations = organizations
    .filter((org: Organization) => org.name !== "Admins" && org.name !== "Drivers")
    .map((org: Organization) => ({ value: org.id, label: org.name }));

  const selectedRole = form.values.role;
  const showAgencyDropdown = selectedRole === Role.AGENCY;

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
          label="Role"
          placeholder="Pick an organization to invite the user to"
          data={ALL_ROLES}
          key={form.key("role")}
          {...form.getInputProps("role")}
        />
      </div>
      {showAgencyDropdown && (
        <div className={classes.formRow}>
          <Select
            withAsterisk
            label="Agency"
            placeholder="Pick an agency"
            data={filteredOrganizations}
            key={form.key("agencyId")}
            {...form.getInputProps("agencyId")}
          />
        </div>
      )}
    </Stack>
  );
};
