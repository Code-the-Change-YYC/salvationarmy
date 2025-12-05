"use client";

import { Anchor, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/_components/common/auth-layout.module.scss";
import Button from "@/app/_components/common/button/Button";
import { authClient } from "@/lib/auth-client";
import { notify } from "@/lib/notifications";
import { emailRegex } from "@/types/validation";
import { api } from "@/trpc/react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getRedirectMutation = api.organization.redirectToDashboard.useMutation({
    onSuccess: (data) => {
      notify.success("Successfully signed in!");
      router.push(data.redirectUrl);
    },
    onError: (error) => {
      notify.error(error.message || "Failed to get redirect URL");
    },
  });

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (emailRegex.test(value) ? null : "Invalid email"),
      password: (value) => (value.length > 0 ? null : "Password is required"),
    },
  });

  // todo: change this to a mutation so that we have access to onSuccess and loading handlers
  // todo2: we need to evaluate what org they are a part of to redirect them properly
  // todo3: after we handle the above, we need to make it so that this redirects them IF they
  // are already logged in to their proper dashboard

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        notify.error(error.message || "Failed to sign in");
      }
      getRedirectMutation.mutate();
    } catch (error) {
      console.error("Sign in error:", error);
      notify.error("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Paper shadow="sm" p="xl" radius="md">
        <Title order={1} mb="md">
          Sign In
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              type="email"
              required
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...form.getInputProps("password")}
            />

            <Button type="submit" loading={loading}>
              Sign In
            </Button>

            <Text size="sm" c="dimmed" ta="center">
              <Anchor href="/forgot-password" size="sm">
                Forgot your password?
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
