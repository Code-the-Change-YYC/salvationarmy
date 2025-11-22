import { requireRole } from "@/lib/auth-helpers";
import { api, HydrateClient } from "@/trpc/server";
import { Role } from "@/types/types";
import styles from "./index.module.css";

export default async function DriverHome() {
  const session = await requireRole([Role.ADMIN, Role.AGENCY]);
  const hello = await api.form.hello({ text: "from tRPC" });

  if (session?.user) {
    void api.form.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Driver home page</h1>
          <p className={styles.showcaseText}>{hello ? hello.greeting : "Loading tRPC query..."}</p>
          <p className={styles.showcaseText}>
            {session && <span>Logged in as {session.user?.name}</span>}
          </p>
        </div>
      </main>
    </HydrateClient>
  );
}
