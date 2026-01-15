"use client";

import { Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { InviteUserForm } from "@/app/_components/admincomponents/invite-user-form";
import Button from "@/app/_components/common/button/Button";
import Modal from "@/app/_components/common/modal/modal";
import Home from "@/assets/icons/home";
import User from "@/assets/icons/user";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { OrganizationRole } from "@/types/types";

type InviteType = "user" | "agency" | null;

export const AdminDashboard = () => {
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteType, setInviteType] = useState<InviteType>(null);

  const organizations = api.organization.getAll.useQuery();

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
      organizationRole: OrganizationRole.MEMBER,
      organizationId: "",
    },
    validate: {
      email: (value) => (value.trim().length > 0 ? null : "Email is required"),
      organizationRole: (value) => (value.trim().length > 0 ? null : "Role is required"),
      organizationId: (value) => (value.trim().length > 0 ? null : "Organization is required"),
    },
  });

  const handleConfirm = () => {
    const validation = form.validate();

    if (validation.hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      return;
    }

    // todo: handle case where admin permissions are given within the organization
    console.log("submit", form.values);

    inviteUserMutation.mutate(form.values);
  };

  const handleCloseModal = () => {
    form.clearErrors();
    setShowInviteModal(false);
    setInviteType(null);
  };

  const handleInviteTypeSelect = (type: "user" | "agency") => {
    setInviteType(type);
  };

  return (
    <>
      <Button onClick={() => setShowInviteModal(true)}>Invite New User</Button>

      {/* Invite Type Selection Modal */}
      {inviteType === null && (
        <Modal
          opened={showInviteModal}
          onClose={handleCloseModal}
          onConfirm={() => {}}
          title={
            <Box fw={600} fz="xl">
              Send an Invite to the Navigation Centre
            </Box>
          }
          size="lg"
          showDefaultFooter={false}
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1rem 0",
            }}
          >
            <Button
              onClick={() => handleInviteTypeSelect("user")}
              height="48px"
              fontSize="18px"
              icon={<User width="24" height="24" stroke="white" />}
            >
              Invite User
            </Button>
            <Button
              onClick={() => handleInviteTypeSelect("agency")}
              height="48px"
              fontSize="18px"
              icon={<Home width="24" height="24" stroke="white" />}
            >
              Invite Agency
            </Button>
          </Box>
        </Modal>
      )}

      {/* Invite User Form Modal */}
      {inviteType === "user" && (
        <Modal
          opened={showInviteModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
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
      )}

      {/* Invite Agency Form Modal - Placeholder */}
      {inviteType === "agency" && (
        <Modal
          opened={showInviteModal}
          onClose={handleCloseModal}
          onConfirm={() => {}}
          title={
            <Box fw={600} fz="xl">
              Invite a new agency
            </Box>
          }
          size="md"
          showDefaultFooter={false}
        >
          <Box p="md">Agency invitation form coming soon...</Box>
        </Modal>
      )}
    </>
  );
};
