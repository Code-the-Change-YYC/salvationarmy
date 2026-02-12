import Navbar from "@/app/_components/common/navbar";
import { requireRole } from "@/lib/auth-helpers";
import { HydrateClient } from "@/trpc/server";
import { Role } from "@/types/types";
import styles from "./driver-layout.module.scss";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  await requireRole([Role.DRIVER, Role.ADMIN]);

  return (
    <HydrateClient>
      <Navbar view="driver" />
      <main className={styles.driverPage}>{children}</main>
    </HydrateClient>
  );
}
