import { BookingInteractiveArea } from "@/app/_components/agencycomponents/agency-interactive-area";
import Navbar from "@/app/_components/common/navbar";
import { HydrateClient } from "@/trpc/server";
import { ViewMode } from "@/types/types";
import styles from "./agency-page.module.scss";

export default async function AgencyHome() {
  return (
    <HydrateClient>
      <Navbar view="agency" />
      <main className={styles.schedulePage}>
        <h1 className={styles.title}>This Week's Navigation Schedule</h1>

        <BookingInteractiveArea initialViewMode={ViewMode.CALENDAR} />
      </main>
    </HydrateClient>
  );
}
