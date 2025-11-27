"use client";

import { Anchor, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import styles from "@/app/_components/common/auth-layout.module.scss";
import Button from "@/app/_components/common/button/Button";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { emailRegex } from "@/types/validation";

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => (emailRegex.test(value) ? null : "Invalid email"),
    },
  });

  const sendResetEmailMutation = api.organization.sendPasswordResetEmail.useMutation({
    onSuccess: (data) => {
      notify.success(`Password reset link sent to ${data.email}`);
      setIsSuccess(true);
    },
    onError: (error) => {
      notify.error(error.message || "Failed to send reset email");
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    sendResetEmailMutation.mutate({
      email: values.email,
    });
  };

  // After user enters recovery email, they see this message
  if (isSuccess) {
    return (
      <div className={styles.container}>
        <Paper shadow="sm" p="xl" radius="md">
          <Title order={1} mb="md">
            Check Your Email
          </Title>

          <Stack gap="md">
            <Text size="sm">
              We've sent a password reset link to <strong>{form.values.email}</strong>.
            </Text>

            <Text size="sm" c="dimmed">
              The link will expire in 1 hour. If you don't see the email, check your spam folder.
            </Text>

            <Text size="sm" ta="center">
              <Anchor href="/login" size="sm">
                Back to login
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </div>
    );
  }

  // Prompt user to enter email for reset-password link
  return (
    <div className={styles.container}>
      <Paper shadow="sm" p="xl" radius="md">
        <Title order={1} mb="md">
          Forgot Password
        </Title>

        <Text size="sm" c="dimmed" mb="md">
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              type="email"
              required
              {...form.getInputProps("email")}
            />

            <Button type="submit" loading={sendResetEmailMutation.isPending}>
              Send Reset Link
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
