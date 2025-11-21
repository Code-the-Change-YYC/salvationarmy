"use client";

import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";

function CompleteRegistrationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const {
    data: userEmail,
    isLoading,
    isError,
    isFetched,
  } = api.organization.verifyTokenAndReturnUserEmail.useQuery(
    { token: token! },
    {
      enabled: !!token,
    },
  );

  const resetPasswordMutation = api.organization.resetPassword.useMutation({
    onSuccess: () => {
      notify.success(`Password successfully reset! You can now log in with your new password.`);

      router.push("/login");
    },
    onError: (error) => {
      notify.error(error.message);
    },
  });

  // todo: we want the user once they are directed for the first time and they don't have a name
  // to set a name. This can be done by setting a col in user that is a boolean that says "nameSet"
  // or something similar. Then we can check that and redirect them or just show a "set your name" page
  const form = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: (value) => {
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(value)) return "Password must contain at least one number";
        return null;
      },
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!token) {
      notify.error("Invalid or missing token.");
      return;
    }

    resetPasswordMutation.mutate({
      token: token,
      newPassword: values.password,
    });
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Title order={2}>Invalid Invitation Link</Title>
        <Text mt="md">
          No invitation token provided. Please contact your administrator for a new invitation.
        </Text>
      </div>
    );
  }

  if (!userEmail && isFetched) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Title order={2}>Invalid Invitation Link</Title>
        <Text mt="md">
          No invitation email provided. Please contact your administrator for a new invitation.
        </Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Text>Verifying your invitation...</Text>
      </div>
    );
  }

  if (isError || !userEmail) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Title order={2}>Invalid Invitation Link</Title>
        <Text mt="md">
          This invitation link is invalid or has expired. Please contact your administrator for a
          new invitation.
        </Text>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "0 1rem" }}>
      <Paper shadow="sm" p="xl" radius="md">
        <Title order={1} mb="md">
          Complete Your Registration
        </Title>
        <Text c="dimmed" mb="xl">
          Welcome! Please set up your account to get started.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              value={userEmail ? userEmail : "Loading..."}
              disabled
              description="This is the email address you were invited with"
            />

            <PasswordInput
              label="Password"
              placeholder="Create a strong password"
              required
              description="Must be at least 8 characters with uppercase, lowercase, and numbers"
              {...form.getInputProps("password")}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              required
              {...form.getInputProps("confirmPassword")}
            />

            <Button type="submit" fullWidth loading={resetPasswordMutation.isPending} mt="md">
              Complete Registration
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompleteRegistrationContent />
    </Suspense>
  );
}
