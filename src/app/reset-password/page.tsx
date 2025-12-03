"use client";

import { Anchor, Paper, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import styles from "@/app/_components/common/auth-layout.module.scss";
import Button from "@/app/_components/common/button/Button";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { passwordSchema } from "@/types/validation";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

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

  const resetPasswordMutation = api.organization.resetPassword.useMutation({
    onSuccess: () => {
      notify.success("Password reset successful! Redirecting to login...");
      router.push("/login");
    },
    onError: (error) => {
      notify.error(error.message || "Failed to reset password");
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    if (!token) {
      notify.error("Invalid or missing reset token");
      return;
    }

    resetPasswordMutation.mutate({
      token,
      newPassword: values.password,
    });
  };

  // Show error if no token in URL
  if (!token) {
    return (
      <div className={styles.container}>
        <Paper shadow="sm" p="xl" radius="md">
          <Title order={1} mb="md">
            Invalid Reset Link
          </Title>

          <Stack gap="md">
            <Text size="sm" c="red">
              This password reset link is invalid or has expired.
            </Text>

            <Text size="sm" ta="center">
              <Anchor href="/forgot-password" size="sm">
                Request a new reset link
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Paper shadow="sm" p="xl" radius="md">
        <Title order={1} mb="md">
          Reset Password
        </Title>

        <Text size="sm" c="dimmed" mb="md">
          Enter your new password below.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              required
              description="Must be at least 8 characters with uppercase, lowercase, and numbers"
              {...form.getInputProps("password")}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              required
              description="Must be at least 8 characters with uppercase, lowercase, and numbers"
              {...form.getInputProps("confirmPassword")}
            />

            <Button type="submit" loading={resetPasswordMutation.isPending}>
              Reset Password
            </Button>

            <Text size="sm" ta="center">
              <Anchor href="/login" size="sm">
                Back to login
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
