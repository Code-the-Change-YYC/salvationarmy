import SurveyViewToggle from "@/app/_components/drivercomponents/surveyButtons/surveyButtons";
import { api, HydrateClient } from "@/trpc/server";
import styles from "./index.module.scss";

export default async function SurveyPage() {
  const initialBookings = await api.bookings.getAll({ surveyCompleted: false });
  const initialSurveys = await api.surveys.getAll();

  return (
    <HydrateClient>
      <main>
        <div className={styles.surveysContainer}>
          <SurveyViewToggle initialBookings={initialBookings} initialSurveys={initialSurveys} />
        </div>
      </main>
    </HydrateClient>
  );
}
