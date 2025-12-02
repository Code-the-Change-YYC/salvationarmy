"use client";

import { Group, Text } from "@mantine/core";
import Link from "next/link";
import Button from "@/app/_components/common/button/Button";
import Bell from "@/assets/icons/bell";
import Home from "@/assets/icons/home";
import Profile from "./profile/profile";

type NavbarView = "admin" | "agency" | "driver";

interface NavbarProps {
  view: NavbarView;
  agencyName?: string; //only used in Agency View
}

export default function Navbar({ view, agencyName }: NavbarProps) {
  return (
    <Group justify="space-between" className="border-bottom" style={{ padding: "1rem 2rem" }}>
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
          <Link href="/admin/rider-logs">
            <Button text="Rider Logs" variant="secondary" />
          </Link>
          <Link href="/admin/vehicle-logs">
            <Button text="Vehicle Log" variant="secondary" />
          </Link>
          <Link href="/admin/schedule">
            <Button text="Schedule" variant="secondary" />
          </Link>
          <Profile />
        </Group>
      )}

      {view === "agency" && (
        <Group gap={30}>
          <Bell />
          <Profile />
        </Group>
      )}

      {view === "driver" && (
        <Group>
          <Profile />
        </Group>
      )}
    </Group>
  );
}
