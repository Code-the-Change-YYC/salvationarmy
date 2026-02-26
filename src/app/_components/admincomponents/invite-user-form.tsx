"use client";
import { Box, Button, Group, Select, Stack, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { Organization } from "better-auth/plugins/organization";
import User from "@/assets/icons/user";
import { ALL_ROLES, OrganizationRole, Role } from "@/types/types";

const SYSTEM_ORG_SLUGS = ["admins", "drivers"];

interface InviteUserForm {
  email: string;
  role: Role;
  organizationRole: OrganizationRole;
  organizationId: string;
}

interface InviteUserFormProps {
  form: UseFormReturnType<InviteUserForm>;
  organizations: Organization[];
}

const NO_ORGS_DATA = [{ value: "", label: "no organizations available", disabled: true }];

const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: "Administrator",
  [Role.DRIVER]: "Driver",
  [Role.AGENCY]: "Agency Member",
};

export const InviteUserForm = ({ form, organizations }: InviteUserFormProps) => {
  const selectedRole = form.values.role;
  const showOrganizationSelect = selectedRole === Role.AGENCY;

  const agencyOrganizations = organizations.filter(
    (org) => !SYSTEM_ORG_SLUGS.includes(org.slug ?? ""),
  );

  const handleRoleChange = (role: Role) => {
    form.setFieldValue("role", role);
    if (role !== Role.AGENCY) {
      form.setFieldValue("organizationId", "");
    }
  };

  return (
    <Stack gap="xl">
      <Stack gap="md">
        <Box fw={600} fz="lg" c="var(--color-primary)">
          Invitee Information
        </Box>
        <TextInput
          withAsterisk
          label="Email Address"
          placeholder="example@gmail.com"
          key={form.key("email")}
          {...form.getInputProps("email")}
        />
      </Stack>

      <Stack gap="md">
        <Box fw={600} fz="lg" c="var(--color-primary)">
          Role Information
        </Box>
        <Box>
          <Box fw={500} mb="xs">
            Invitee Role in the Navigation Centre
          </Box>
          <Group gap="sm">
            {ALL_ROLES.map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? "filled" : "default"}
                color={selectedRole === role ? "var(--color-primary)" : "gray"}
                leftSection={
                  <User
                    width="16"
                    height="16"
                    stroke={selectedRole === role ? "white" : "#434343"}
                  />
                }
                onClick={() => handleRoleChange(role)}
                style={{
                  flex: 1,
                  backgroundColor: selectedRole === role ? "var(--color-primary)" : undefined,
                }}
              >
                {ROLE_LABELS[role]}
              </Button>
            ))}
          </Group>
        </Box>
        <Select
          withAsterisk
          label="Organization Permission Level"
          placeholder="Select permission level"
          data={[
            { value: OrganizationRole.MEMBER, label: "Member" },
            { value: OrganizationRole.ADMIN, label: "Admin" },
          ]}
          key={form.key("organizationRole")}
          {...form.getInputProps("organizationRole")}
        />
        {showOrganizationSelect && (
          <Select
            withAsterisk
            label="Affiliated Agency"
            placeholder="Select an agency"
            data={
              agencyOrganizations.length > 0
                ? agencyOrganizations.map((org) => ({ value: org.id, label: org.name }))
                : NO_ORGS_DATA
            }
            key={form.key("organizationId")}
            {...form.getInputProps("organizationId")}
          />
        )}
      </Stack>
    </Stack>
  );
};
