"use client";

import { Group, Text } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/app/_components/common/button/Button";
import Bell from "@/assets/icons/bell";
import Home from "@/assets/icons/home";
import styles from "./navbar.module.scss";
import Profile from "./profile/profile";

type NavbarView = "admin" | "agency" | "driver";

interface NavbarProps {
  view: NavbarView;
  agencyName?: string;
}

export default function Navbar({ view, agencyName }: NavbarProps) {
  const pathname = usePathname();

  const section = pathname.split("/")[2] ?? "home";

  const navbarText = () => {
    switch (view) {
      case "admin":
        return `Admin ${section}`;
      case "agency":
        return `${agencyName ?? "[Agency name]"} ${section}`;
      case "driver":
        return `Driver ${section}`;
      default:
        return "";
    }
  };

  const homeLink = () => {
    switch (view) {
      case "admin":
        return `/admin/home`;
      case "agency":
        return `/agency/home`;
      case "driver":
        return `/driver/home`;
    }
  };

  return (
    <Group justify="space-between" className={`border-bottom ${styles.navbar}`}>
      <Group>
        <Link className={styles.flex} href={homeLink()}>
          <Home />
        </Link>
        <Text>{navbarText()}</Text>
      </Group>

      {view === "admin" && (
        <Group gap={20}>
          <Link href="/admin/agencies">
            <Button text="View Agencies" variant="secondary" />
          </Link>
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
        <Group gap={30}>
          <Link href="/driver/surveys">
            <Button text="Surveys" variant="secondary" />
          </Link>
          <Bell />
          <Profile />
        </Group>
      )}
    </Group>
  );
}
