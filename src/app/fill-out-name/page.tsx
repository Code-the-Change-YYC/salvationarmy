"use client";

import { Paper, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import Button from "@/app/_components/common/button/Button";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { nameRegex } from "@/types/validation";

export default function FillOutNamePage() {
  const router = useRouter();

  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) => (nameRegex.test(value) ? null : "Invalid name"),
    },
  });

  const redirectUserMutation = api.organization.redirectToDashboard.useMutation({
    onSuccess: (data) => {
      router.replace(data.redirectUrl);
    },
    onError: (error) => {
      notify.error(error.message || "Failed to get redirect URL");
    },
  });

  const changeNameMutation = api.organization.changeName.useMutation({
    onSuccess: () => {
      notify.success(`Name successfully set!`);
      redirectUserMutation.mutate();
    },
    onError: (error) => {
      notify.error(error.message);
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    changeNameMutation.mutate({
      newName: values.name,
    });
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

            <Button type="submit" loading={changeNameMutation.isPending}>
              Continue
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
