"use client";
import { Box, Button, Group, Select, Stack, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { Organization } from "better-auth/plugins/organization";
import User from "@/assets/icons/user";
import { ALL_ORGANIZATION_ROLES, OrganizationRole } from "@/types/types";

interface InviteUserForm {
  email: string;
  organizationRole: OrganizationRole;
  organizationId: string;
}

interface InviteUserFormProps {
  form: UseFormReturnType<InviteUserForm>;
  organizations: Organization[];
}

const NO_ORGS_DATA = [{ value: "", label: "no organizations available", disabled: true }];

const ROLE_LABELS: Record<OrganizationRole, string> = {
  [OrganizationRole.ADMIN]: "Administrator",
  [OrganizationRole.OWNER]: "Driver",
  [OrganizationRole.MEMBER]: "Agency member",
};

export const InviteUserForm = ({ form, organizations }: InviteUserFormProps) => {
  const organizationRole = form.values.organizationRole;
  const showOrganizationSelect = organizationRole === OrganizationRole.MEMBER;

  const handleRoleChange = (role: OrganizationRole) => {
    form.setFieldValue("organizationRole", role);
    // Clear organization when role changes to non-member
    if (role !== OrganizationRole.MEMBER) {
      form.setFieldValue("organizationId", "");
    }
  };

  return (
    <Stack gap="xl">
      <Stack gap="md">
        <Box fw={600} fz="lg" c="#8B2635">
          Invitee Information
        </Box>
        <TextInput
          withAsterisk
          label="Email Address (Gmail only)"
          placeholder="Example@gmail.com"
          key={form.key("email")}
          {...form.getInputProps("email")}
        />
      </Stack>

      <Stack gap="md">
        <Box fw={600} fz="lg" c="#8B2635">
          Role Information
        </Box>
        <Box>
          <Box fw={500} mb="xs">
            Invitee Role in the Navigation Centre
          </Box>
          <Group gap="sm">
            {ALL_ORGANIZATION_ROLES.map((role) => (
              <Button
                key={role}
                variant={organizationRole === role ? "filled" : "default"}
                color={organizationRole === role ? "#8B2635" : "gray"}
                leftSection={
                  <User
                    width="16"
                    height="16"
                    stroke={organizationRole === role ? "white" : "#434343"}
                  />
                }
                onClick={() => handleRoleChange(role)}
                style={{
                  flex: 1,
                  backgroundColor: organizationRole === role ? "#8B2635" : undefined,
                }}
              >
                {ROLE_LABELS[role]}
              </Button>
            ))}
          </Group>
        </Box>
        {showOrganizationSelect && (
          <Select
            withAsterisk
            label="Affiliated Agency"
            placeholder="Select an agency"
            data={
              organizations.length > 0
                ? organizations.map((org) => ({ value: org.id, label: org.name }))
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
