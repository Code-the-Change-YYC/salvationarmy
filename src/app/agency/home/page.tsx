import { requireRole } from "@/lib/auth-helpers";
import { HydrateClient, api } from "@/trpc/server";
import styles from "./index.module.css";

export default async function AgencyHome() {
  const session = await requireRole(["admin", "agency"]);
  const hello = await api.form.hello({ text: "from tRPC" });

  if (session?.user) {
    void api.form.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Agency home page</h1>
          <p className={styles.showcaseText}>{hello ? hello.greeting : "Loading tRPC query..."}</p>
          <p className={styles.showcaseText}>
            {session && <span>Logged in as {session.user?.name}</span>}
          </p>
        </div>
      </main>
    </HydrateClient>
  );
}
