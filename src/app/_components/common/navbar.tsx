"use client";

import { Group, Text } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Bell from "@/assets/icons/bell";
import Home from "@/assets/icons/home";
import styles from "./navbar.module.scss";
import Profile from "./profile/profile";

type NavbarView = "admin" | "agency" | "driver";

interface NavbarProps {
  view: NavbarView;
  agencyName?: string;
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={styles.navLink}>
      <span className={isActive ? styles.navLinkActive : styles.navLinkDefault}>{children}</span>
    </Link>
  );
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
        <Home />
        <Text>{view === "agency" ? `${agencyName ?? "[Agency name]"} Home` : ""}</Text>
      </Group>

      {view === "admin" && (
        <Group gap={30}>
          <NavLink href="/admin/agencies">View Agencies</NavLink>
          <NavLink href="/admin/invite">Invite</NavLink>
          <NavLink href="/admin/rider-logs">Rider Logs</NavLink>
          <NavLink href="/admin/driver-logs">Vehicle Logs</NavLink>
          <NavLink href="/admin/schedule">View Schedule</NavLink>
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
          <NavLink href="/driver/surveys">Surveys</NavLink>
          <Bell />
          <Profile />
        </Group>
      )}
    </Group>
  );
}
