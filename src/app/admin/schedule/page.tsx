import { BookingInteractiveArea } from "@/app/_components/agencycomponents/agency-interactive-area";
import { ViewMode } from "@/types/types";

export default async function SchedulePage() {
  return <BookingInteractiveArea initialViewMode={ViewMode.CALENDAR} />;
}
