"use client";

import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import styles from "@/app/_components/common/auth-layout.module.scss";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { passwordSchema, phoneNumberSchema } from "@/types/validation";

function CompleteRegistrationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const {
    data: userData,
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
      phoneNumber: "",
    },
    validate: {
      password: (value) => {
        const res = passwordSchema.safeParse(value);
        return res.success ? null : res.error.message;
      },
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
      phoneNumber: (value) => {
        if (userData?.role !== "driver") return null;
        if (!value || value.trim().length === 0) return "Phone number is required";
        const res = phoneNumberSchema.safeParse(value.trim());
        return res.success ? null : (res.error.message ?? "Invalid phone number format");
      },
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
      phoneNumber: userData?.role === "driver" ? values.phoneNumber : undefined,
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

  if (isError || !userData) {
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
                value={userData.email ?? "Loading..."}
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

              {userData.role === "driver" && (
                <div>
                  <Text size="sm" fw={500} mb={4}>
                    Phone Number{" "}
                    <Text span c="red">
                      *
                    </Text>
                  </Text>

                  <PhoneInput
                    international
                    defaultCountry="CA"
                    countryCallingCodeEditable={false}
                    placeholder="Enter phone number"
                    value={form.values.phoneNumber || undefined}
                    onChange={(value) => form.setFieldValue("phoneNumber", value ?? "")}
                  />

                  <Text size="xs" c="dimmed" mt={4}>
                    Used for driver contact and SMS notifications
                  </Text>

                  {form.errors.phoneNumber && (
                    <Text size="xs" c="red" mt={4}>
                      {form.errors.phoneNumber}
                    </Text>
                  )}
                </div>
              )}

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
