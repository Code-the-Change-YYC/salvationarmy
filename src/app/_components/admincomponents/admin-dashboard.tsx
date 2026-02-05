"use client";

import { Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { InviteAgencyForm } from "@/app/_components/admincomponents/invite-agency-form";
import { InviteUserForm } from "@/app/_components/admincomponents/invite-user-form";
import Button from "@/app/_components/common/button/Button";
import Modal from "@/app/_components/common/modal/modal";
import Home from "@/assets/icons/home";
import User from "@/assets/icons/user";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { OrganizationRole, Role } from "@/types/types";

type InviteType = "user" | "agency" | null;

export const AdminDashboard = () => {
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteType, setInviteType] = useState<InviteType>(null);

  const organizations = api.organization.getAll.useQuery();

  const inviteUserMutation = api.organization.inviteUser.useMutation({
    onSuccess: (data) => {
      notify.success(`Invitation sent to ${data.email}`);
      userForm.reset();
      setShowInviteModal(false);
    },
    onError: (error) => {
      notify.error(error.message || "Failed to send invitation");
    },
  });

  const createAgencyMutation = api.organization.createOrganization.useMutation({
    onSuccess: (data) => {
      if (!data) return;
      notify.success(`Agency "${data.name}" created successfully`);
      agencyForm.reset();
      setShowInviteModal(false);
      void organizations.refetch();
    },
    onError: (error) => {
      notify.error(error.message || "Failed to create agency");
    },
  });

  const userForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      role: Role.DRIVER,
      organizationRole: OrganizationRole.MEMBER,
      organizationId: "",
    },
    validate: {
      email: (value) => {
        if (value.trim().length === 0) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Invalid email address";
        return null;
      },
      role: (value) => (value.trim().length > 0 ? null : "Role is required"),
      organizationId: (value, values) => {
        if (values.role === Role.AGENCY) {
          return value.trim().length > 0 ? null : "Organization is required";
        }
        return null;
      },
    },
  });

  const agencyForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      slug: "",
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Agency name is required"),
      slug: (value) => {
        if (value.trim().length === 0) return "Agency slug is required";
        if (!/^[a-z0-9-]+$/.test(value))
          return "Slug must only contain lowercase letters, numbers, and hyphens";
        return null;
      },
    },
  });

  const handleUserConfirm = () => {
    const validation = userForm.validate();

    if (validation.hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      return;
    }

    const formValues = userForm.getValues();

    // Determine the organization ID based on application role
    let organizationId: string;
    const appRole = formValues.role;

    if (appRole === Role.ADMIN) {
      const adminsOrg = organizations.data?.find((org) => org.slug === "admins");
      if (!adminsOrg) {
        notify.error("Admins organization not found");
        return;
      }
      organizationId = adminsOrg.id;
    } else if (appRole === Role.DRIVER) {
      const driversOrg = organizations.data?.find((org) => org.slug === "drivers");
      if (!driversOrg) {
        notify.error("Drivers organization not found");
        return;
      }
      organizationId = driversOrg.id;
    } else {
      organizationId = formValues.organizationId;
    }

    const submitData = {
      email: formValues.email,
      organizationRole: formValues.organizationRole,
      role: formValues.role,
      organizationId,
    };

    console.log("submit user", submitData);
    inviteUserMutation.mutate(submitData);
  };

  const handleAgencyConfirm = () => {
    const validation = agencyForm.validate();

    if (validation.hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      return;
    }

    const formValues = agencyForm.getValues();
    console.log("submit agency", formValues);
    createAgencyMutation.mutate(formValues);
  };

  const handleCloseModal = () => {
    userForm.clearErrors();
    agencyForm.clearErrors();
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
          onConfirm={handleUserConfirm}
          title={
            <Box fw={600} fz="xl">
              Invite a User
            </Box>
          }
          size="lg"
          showDefaultFooter
          confirmText="Invite to Navigation Centre"
          cancelText="Cancel Invite"
          loading={inviteUserMutation.isPending}
        >
          <InviteUserForm organizations={organizations.data ?? []} form={userForm} />
        </Modal>
      )}

      {/* Invite Agency Form Modal */}
      {inviteType === "agency" && (
        <Modal
          opened={showInviteModal}
          onClose={handleCloseModal}
          onConfirm={handleAgencyConfirm}
          title={
            <Box fw={600} fz="xl">
              Invite an Agency
            </Box>
          }
          size="lg"
          showDefaultFooter
          confirmText="Invite to Navigation Centre"
          cancelText="Cancel Invite"
          loading={createAgencyMutation.isPending}
        >
          <InviteAgencyForm form={agencyForm} />
        </Modal>
      )}
    </>
  );
};
