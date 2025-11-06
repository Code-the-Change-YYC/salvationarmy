"use client";

import Bell from "@/assets/icons/bell";
import Home from "@/assets/icons/home";
import User from "@/assets/icons/user";
import { Group, Text } from "@mantine/core";
import Button from "./Button";

type NavbarView = "admin" | "agency" | "driver";

interface NavbarProps {
  view: NavbarView;
  agencyName?: string; //only used in Agency View
}

export default function Navbar({ view, agencyName }: NavbarProps) {
  return (
    <Group justify="space-between" px="lg" py="md">
      <Group>
        <Home />
        <Text>
          {view === "admin"
            ? "Admin Home"
            : view === "agency"
              ? `${agencyName ?? "[Agency name]"} Home`
              : ""}
        </Text>
      </Group>

      {view === "admin" && (
        <Group gap={20}>
          <Button text="Rider Logs" variant="secondary" />
          <Button text="Vehicle Log" variant="secondary" />
          <Button text="Schedule" variant="secondary" />
          <User />
        </Group>
      )}

      {view === "agency" && (
        <Group gap={30}>
          <Bell />
          <User />
        </Group>
      )}

      {view === "driver" && (
        <Group>
          <User />
        </Group>
      )}
    </Group>
  );
}
