import Navbar from "@/app/_components/common/navbar";
import { requireRole } from "@/lib/auth-helpers";
import { HydrateClient } from "@/trpc/server";
import { Role } from "@/types/types";
import styles from "./admin-layout.module.scss";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole([Role.ADMIN]);

  return (
    <HydrateClient>
      <Navbar view="admin" />
      <main className={styles.adminPage}>{children}</main>
    </HydrateClient>
  );
}
