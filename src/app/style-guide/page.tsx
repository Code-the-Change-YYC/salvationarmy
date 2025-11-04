"use client";

import Bell from "@/assets/icons/bell";
import Calendar from "@/assets/icons/calendar";
import Chevron from "@/assets/icons/chevron";
import Clock from "@/assets/icons/clock";
import Cross from "@/assets/icons/cross";
import Plus from "@/assets/icons/plus";
import { Divider, Group, Stack, Title } from "@mantine/core";
import Button from "../_components/Button";

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
            <Button icon={<Plus />} variant="icon" /> icon
            <Button icon={<Bell />} variant="icon" /> small
            <Button icon={<Calendar />} variant="icon" /> large
            <Button icon={<Chevron />} variant="icon" disabled /> disabled
            <Button icon={<Clock />} variant="icon" /> custom width
            <Button icon={<Cross />} variant="icon" /> custom height
          </Group>
        </Stack>
      </Stack>

      <Divider />
    </Stack>
  );
}
