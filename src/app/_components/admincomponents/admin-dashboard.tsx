"use client";

import { Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { InviteUserForm } from "@/app/_components/admincomponents/invite-user-form";
import Button from "@/app/_components/common/button/Button";
import Modal from "@/app/_components/common/modal/modal";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { OrganizationRole } from "@/types/types";
import TransportRequestModal from "./transport-request-modal";

export const AdminDashboard = () => {
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showTransportRequestModal, setShowTransportRequestModal] = useState<boolean>(false);

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

  return (
    <>
      <Button onClick={() => setShowInviteModal(true)}>Invite New User</Button>
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

      <Button onClick={() => setShowTransportRequestModal(true)}>
        temp review transport modal button
      </Button>
      <TransportRequestModal
        isOpen={showTransportRequestModal}
        onClose={() => {
          setShowTransportRequestModal(false);
          console.log("closed");
        }}
        onDecline={() => {
          setShowTransportRequestModal(false);
          console.log("declined");
        }}
        onApprove={() => {
          console.log("approved");
        }}
        agencyName="Amazing Agency"
        residentName="John Doe"
        contactInfo="123-456-7890"
        additionalInfo="Requires support entering and exiting due to wheelchair use."
        dateAndTime="September 26, 2025 | 11:30 AM"
        purpose="Doctor's Appointment"
        destinationAddress="123 Someplace St SW"
        transportRating={2}
        prevDriverNotes="Passenger was visibly intoxicated during the ride, and requested to be dropped off at a different location than the requested address."
        requestedDiffLocation={true}
      />
    </>
  );
};
