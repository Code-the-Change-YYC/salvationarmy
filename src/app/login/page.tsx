"use client";

import { Anchor, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/_components/common/auth-layout.module.scss";
import Button from "@/app/_components/common/button/Button";
import AlbertaLogo from "@/assets/icons/alberta";
import SalvationLogo from "@/assets/icons/salvation";
import { authClient } from "@/lib/auth-client";
import { emailRegex } from "@/types/validation";
import ui from "./Login.module.scss";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        alert(error.message || "Failed to sign in");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      alert("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

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
