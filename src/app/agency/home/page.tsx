import { AgencyInteractiveArea } from "@/app/_components/agencycomponents/agency-interactive-area";
import Navbar from "@/app/_components/navbar";
import { api, HydrateClient } from "@/trpc/server";
import { ViewMode } from "@/types/types";
import styles from "./agency-page.module.scss";

export default async function AgencyHome() {
  // server side call
  await api.form.hello({ text: "from tRPC" });

  return (
    <HydrateClient>
      <Navbar view="agency" />
      <main className={styles.schedulePage}>
        <h1 className={styles.title}>This Week's Navigation Schedule</h1>

        <AgencyInteractiveArea initialViewMode={ViewMode.CALENDAR} />
      </main>
    </HydrateClient>
  );
}
