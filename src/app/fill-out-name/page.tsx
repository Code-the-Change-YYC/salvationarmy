"use client";

import { Paper, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/_components/common/button/Button";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";

export default function FillOutNamePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  const changeNameMutation = api.organization.changeName.useMutation({
    onSuccess: () => {
      notify.success(`Name successfully set!`);
      //TODO V: change later when we know where to send the user
      router.push("/dashboard");
      setLoading(false);
    },
    onError: (error) => {
      notify.error(error.message);
      setLoading(false);
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    //Alphanumeric regex of length >=3. Allows for exactly 1 space between characters
    const regex = /^(?!.*\s{2})[A-Za-z0-9][A-Za-z0-9\s]*[A-Za-z0-9][A-Za-z0-9\s]*[A-Za-z0-9]$/;
    if (!regex.test(values.name)) {
      //User inputted name is not proper
      notify.error("Invalid Name");
      setLoading(false);
    } else {
      //User name is proper
      changeNameMutation.mutate({
        newName: values.name,
      });
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "0 1rem" }}>
      <Paper shadow="sm" p="xl" radius="md">
        <Title order={1} mb="md">
          Add Your Name
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Alphanumeric, 3+ Characters"
              type="text"
              required
              {...form.getInputProps("name")}
            />

            <Button type="submit" loading={loading}>
              Continue
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
