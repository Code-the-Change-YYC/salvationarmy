"use client";

import { Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useState } from "react";
import { InviteUserForm } from "@/app/_components/admincomponents/invite-user-form";
import { CreateOrgsButton } from "@/app/_components/admincomponents/test/adminbutton";
import Button from "@/app/_components/common/button/Button";
import Modal from "@/app/_components/common/modal/modal";
import { notify } from "@/lib/notifications";
import type { Organization } from "@/server/db/auth-schema";
import { api } from "@/trpc/react";
import { OrganizationRole, Role } from "@/types/types";

export const AdminDashboard = () => {
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);

  const organizations = api.organization.getAll.useQuery() as {
    data: Organization[];
  };

  const inviteUserMutation = api.organization.inviteUser.useMutation({
    onSuccess: (data) => {
      notify.success(`Invitation sent to ${data.email}`);
      form.reset();
      setShowInviteModal(false);
    },
    onError: (error) => {
      notify.error(error.message || "Failed to send invitation");
    },
  });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      role: Role.DRIVER,
      agencyId: "",
    },
    validate: {
      email: (value) => (value.trim().length > 0 ? null : "Email is required"),
      role: (value) => (value.trim().length > 0 ? null : "Role is required"),
      agencyId: (value, values) => {
        // Only validate agencyId if role is AGENCY
        if (values.role === Role.AGENCY && value.trim().length === 0) {
          return "Agency is required for agency role";
        }
        return null;
      },
    },
  });

  const handleConfirm = () => {
    const validation = form.validate();

    if (validation.hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      return;
    }

    const values = form.values;

    // Determine the organization based on role
    let organizationId = values.agencyId;

    if (values.role === Role.ADMIN) {
      // Find the "Admins" organization
      const adminOrg = organizations.data?.find((org) => org.name === "Admins");
      organizationId = adminOrg?.id || "";
    } else if (values.role === Role.DRIVER) {
      // Find the "Drivers" organization
      const driverOrg = organizations.data?.find((org) => org.name === "Drivers");
      organizationId = driverOrg?.id || "";
    }

    // todo: handle case where admin permissions are given within the organization
    const submissionData = {
      ...values,
      organizationId: organizationId,
      role: OrganizationRole.MEMBER,
    };

    console.log("submit", submissionData);

    inviteUserMutation.mutate(submissionData);
  };

  return (
    <>
      <Button onClick={() => setShowInviteModal(true)}>Invite New User</Button>
      <CreateOrgsButton />
      <Modal
        opened={showInviteModal}
        onClose={() => {
          form.clearErrors();
          setShowInviteModal(false);
        }}
        onConfirm={() => {
          handleConfirm();
        }}
        title={
          <Box fw={600} fz="xl">
            Invite a new user
          </Box>
        }
        size="md"
        showDefaultFooter
        confirmText="Send Invitation"
        loading={inviteUserMutation.isPending}
      >
        <InviteUserForm organizations={organizations.data ?? []} form={form} />
      </Modal>
    </>
  );
};
