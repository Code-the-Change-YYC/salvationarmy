"use client";

import { Anchor, Paper, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Button from "@/app/_components/common/button/Button";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: (value) => (value.length > 0 ? null : "Password is required"),
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (error) {
        setError(error.message || "Failed to reset password");
      } else {
        alert("Password reset successful! Redirecting to login...");
        router.push("/login");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show error if no token in URL
  if (!token) {
    return (
      <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "0 1rem" }}>
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
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "0 1rem" }}>
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
              {...form.getInputProps("password")}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              required
              {...form.getInputProps("confirmPassword")}
            />

            {error && (
              <Text size="sm" c="red">
                {error}
              </Text>
            )}

            <Button type="submit" loading={loading}>
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
