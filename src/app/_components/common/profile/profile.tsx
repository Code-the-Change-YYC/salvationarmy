"use client";

import { Menu } from "@mantine/core";
import { useRouter } from "next/navigation";
import Arrow from "@/assets/icons/arrow";
import User from "@/assets/icons/user";
import { authClient, useSession } from "@/lib/auth-client";
import { notify } from "@/lib/notifications";
import Button from "../button/Button";
import IconButton from "../button/IconButton";
import styles from "./Profile.module.scss";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  function logout() {
    authClient
      .signOut()
      .then(() => {
        router.push("/logout");
      })
      .catch((err) => {
        console.error("Logout failed:", err);
        notify.error("Logout Failed");
      });
  }
  return (
    <Menu
      shadow="md"
      width={350}
      classNames={{ dropdown: styles.logout, label: styles.logoutText }}
    >
      <Menu.Target>
        <IconButton ariaLabel="Button" icon={<User />} color="blue" transparent={true}></IconButton>
      </Menu.Target>

      <Menu.Dropdown>
        <div className={styles.profileCard}>
          <div className={styles.profilePicture}></div>
          <div>
            <div className={styles.usernameText}>{session?.user.name}</div>
            <div className={styles.emailText}>{session?.user.email}</div>
          </div>
        </div>
        <Button width={"100%"} icon={<Arrow width={"18px"} />} onClick={logout}>
          Log out
        </Button>
      </Menu.Dropdown>
    </Menu>
  );
}
