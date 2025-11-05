import Bell from "@/assets/icons/bell";
import Face from "@/assets/icons/face";
import Home from "@/assets/icons/home";

import { AgencyInteractiveArea } from "@/app/_components/agencycomponents/agency-interactive-area";
import { HydrateClient, api } from "@/trpc/server";
import { ViewMode } from "@/types/types";
import styles from "./agency-page.module.scss";

export default async function AgencyHome() {
  // server side call
  await api.form.hello({ text: "from tRPC" });

  return (
    <HydrateClient>
      <main className={styles.schedulePage}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Home />
            <span>agency name home</span>
          </div>
          <div className={styles.headerRight}>
            <Bell />
            <Face />
          </div>
        </header>
        <h1 className={styles.title}>This Week's Navigation Schedule</h1>

        <AgencyInteractiveArea initialViewMode={ViewMode.CALENDAR} />
      </main>
    </HydrateClient>
  );
}
