"use client";

import Chevron from "@/assets/icons/chevron";
import Face from "@/assets/icons/face";
import Location from "@/assets/icons/location";
import Plus from "@/assets/icons/plus";
import { Divider, Group, Stack, Title } from "@mantine/core";
import Button from "../_components/Button";
import IconButton from "../_components/IconButton";

export default function StylesPage() {
  return (
    <Stack p="xl" gap="xl">
      <Title order={1}>Component Style Guide</Title>

      <Divider />

      <Stack gap="md">
        <Title order={2}>Buttons</Title>

        <Stack gap="sm">
          <Title order={3} size="h4">
            Primary Buttons
          </Title>
          <Group>
            <Button text="Primary Button" />
            <Button text="Add booking" icon={<Plus />} />
            <Button text="Custom Width" width="200px" />
            <Button text="Custom Height" height="50px" />
          </Group>
        </Stack>

        <Stack gap="sm">
          <Title order={3} size="h4">
            Secondary Buttons
          </Title>
          <Group>
            <Button text="Secondary Button" variant="secondary" />
            <Button text="With Icon" variant="secondary" icon={<Plus />} />
            <Button text="Custom Width" variant="secondary" width="200px" />
            <Button text="Custom Height" variant="secondary" height="50px" />
          </Group>
        </Stack>

        <Stack gap="sm">
          <Title order={3} size="h4">
            Disabled Buttons
          </Title>
          <Group>
            <Button text="Disabled Button" disabled />
          </Group>
        </Stack>

        <Stack gap="sm">
          <Title order={3} size="h4">
            Icon Buttons
          </Title>
          <Group>
            <IconButton icon={<Plus />} ariaLabel="plus" size="sm" /> sm
            <IconButton icon={<Plus />} ariaLabel="plus" size="lg" /> lg
            <IconButton icon={<Chevron />} ariaLabel="chevron" disabled />
            disabled
            <IconButton icon={<Face />} ariaLabel="face" width="200px" />
            Custom Width
            <IconButton icon={<Location />} ariaLabel="location" height="50px" />
            Custom Height
          </Group>
          <Group>
            <IconButton icon={<Plus />} ariaLabel="plus" variant="outline" /> outline
            <IconButton icon={<Plus />} ariaLabel="plus" variant="transparent" /> transparent
          </Group>
        </Stack>
      </Stack>

      <Divider />
    </Stack>
  );
}
