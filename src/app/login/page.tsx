"use client";

import { Anchor, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/_components/common/auth-layout.module.scss";
import Button from "@/app/_components/common/button/Button";
import AlbertaLogo from "@/assets/icons/alberta";
import SalvationLogo from "@/assets/icons/salvation";
import { authClient } from "@/lib/auth-client";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { emailRegex } from "@/types/validation";
import LoadingScreen from "../_components/common/loadingscreen";
import ui from "./Login.module.scss";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const hasRedirected = useRef(false);

  const { mutate } = api.organization.redirectToDashboard.useMutation({
    onSuccess: (data) => {
      notify.success("Successfully signed in!");
      router.replace(data.redirectUrl);
    },
    onError: (error) => {
      notify.error(error.message || "Failed to get redirect URL");
      hasRedirected.current = false;
    },
  });

  useEffect(() => {
    if (!sessionLoading && session && !hasRedirected.current) {
      hasRedirected.current = true;
      mutate();
    }
  }, [session, sessionLoading, mutate]);

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

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    hasRedirected.current = false;

    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        notify.error(error.message || "Failed to sign in");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      notify.error("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading || (!sessionLoading && session)) {
    return <LoadingScreen message="Redirecting..." />;
  }

  return (
    <div className={ui.background}>
      <div className={styles.container}>
        <Paper className={ui.form}>
          <div className={ui.logo}>
            <SalvationLogo />
            <AlbertaLogo />
          </div>

          <Title order={1} className={ui.title}>
            Log in to the Navigation Centre
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

              <Anchor href="/forgot-password" className={ui.forgotPass}>
                Forgot your password?
              </Anchor>

              <Button type="submit" loading={loading}>
                Log in
              </Button>

              <Text className={ui.bottomText}>
                <Text component="span" className={ui.links}>
                  Don't have an account?{" "}
                </Text>

                {/*TODO: CHANGE CONTACT EMAIL TO SALVATION ARMY ONE ONCE KNOWN V*/}
                <Anchor href="mailto:changeEmail@AtSomePoint.com" className={ui.contactAdmin}>
                  Contact an administrator
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </div>
    </div>
  );
}
