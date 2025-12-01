"use client";

import { ActionIcon, Menu } from "@mantine/core";
import { useRouter } from "next/navigation";
import Logout from "@/assets/icons/logout";
import User from "@/assets/icons/user";
import { useSession } from "@/lib/auth-client";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  function logout() {
    router.push("/logout");
  }
  return (
    <Menu shadow="md" width={250}>
      <Menu.Target>
        <ActionIcon variant="transparent" style={{ padding: 0, zIndex: 1 }}>
          <User />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Name: {session?.user.name}</Menu.Label>
        <Menu.Label>Email: {session?.user.email}</Menu.Label>

        <Menu.Divider />
        <Menu.Item color="red" onClick={logout} leftSection={<Logout width={16} height={16} />}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
