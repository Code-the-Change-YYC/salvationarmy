import Navbar from "@/app/_components/navbar";
import { requireRole } from "@/lib/auth-helpers";
import { HydrateClient } from "@/trpc/server";
import { Role } from "@/types/types";
import styles from "./admin-layout.module.scss";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole([Role.ADMIN]);

  console.log(session?.user);

  return (
    <HydrateClient>
      <Navbar view="admin" />
      <main className={styles.adminPage}>
        <h1 className={styles.title}>Hello, {session.user?.name}</h1>
        {children}
      </main>
    </HydrateClient>
  );
}
