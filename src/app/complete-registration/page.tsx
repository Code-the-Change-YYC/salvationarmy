"use client";

import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { passwordSchema } from "@/types/validation";
import styles from "./page.module.scss";

function CompleteRegistrationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const {
    data: userEmail,
    isLoading,
    isError,
  } = api.organization.verifyTokenAndReturnUserEmail.useQuery(
    { token: token ?? "" },
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
        const res = passwordSchema.safeParse(value);
        return res.success ? null : res.error.message;
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
      <div className={styles.center}>
        <Title order={2}>Invalid Invitation Link</Title>
        <Text mt="md">
          No invitation token provided. Please contact your administrator for a new invitation.
        </Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Text>Verifying your invitation...</Text>
      </div>
    );
  }

  if (isError || !userEmail) {
    return (
      <div className={styles.center}>
        <Title order={2}>Invalid Invitation Link</Title>
        <Text mt="md">
          This invitation link is invalid or has expired. Please contact your administrator for a
          new invitation.
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.paperWrapper}>
        <Paper shadow="sm" p="xl" radius="md">
          <Title order={1} className={styles.title}>
            Complete Your Registration
          </Title>
          <Text c="dimmed" className={styles.dimmedText}>
            Welcome! Please set up your account to get started.
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md" className={styles.formStack}>
              <TextInput
                label="Email"
                value={userEmail ?? "Loading..."}
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
