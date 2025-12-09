"use client";

import { Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import Arrow from "@/assets/icons/arrow";
import Cross from "@/assets/icons/cross";
import User from "@/assets/icons/user";
import { authClient, useSession } from "@/lib/auth-client";
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
        notifications.show({
          id: "logout-error",
          position: "bottom-center",
          withCloseButton: true,
          autoClose: 5000,
          title: "Error",
          message: "Logout Failed",
          color: "white",
          icon: <Cross />,
        });
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
