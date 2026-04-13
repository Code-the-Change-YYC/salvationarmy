"use client";

import { Group, Text } from "@mantine/core";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AdminDashboard } from "@/app/_components/admincomponents/admin-dashboard";
import Bell from "@/assets/icons/bell";
import Home from "@/assets/icons/home";
import { api } from "@/trpc/react";
import IconButton from "./button/IconButton";
import styles from "./navbar.module.scss";
import Profile from "./profile/profile";

type NavbarView = "admin" | "agency" | "driver";

interface NavbarProps {
  view: NavbarView;
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

export default function Navbar({ view }: NavbarProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const router = useRouter();

  const agencyName = api.organization.getUserOrgName.useQuery(undefined, {
    enabled: view === "agency",
  }).data;

  const { mutate } = api.organization.redirectToDashboard.useMutation({
    onSuccess: (data) => {
      router.replace(data.redirectUrl);
    },
  });
  return (
    <Group justify="space-between" className={`border-bottom ${styles.navbar}`}>
      <Group>
        <IconButton
          onClick={() => mutate()}
          ariaLabel="Button"
          icon={<Home />}
          color="blue"
          transparent={true}
        ></IconButton>
        <Text>{view === "agency" ? (agencyName ? `${agencyName} Home` : "Loading...") : ""}</Text>
      </Group>

      {view === "admin" && (
        <Group gap={30}>
          <NavLink href="/admin/agencies">View Agencies</NavLink>
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className={`${styles.navLink} ${styles.navLinkButton}`}
          >
            <span className={styles.navLinkDefault}>Invite</span>
          </button>
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

      {view === "admin" && (
        <AdminDashboard
          inviteModalOpened={inviteModalOpen}
          onInviteModalClose={() => setInviteModalOpen(false)}
        />
      )}
    </Group>
  );
}
