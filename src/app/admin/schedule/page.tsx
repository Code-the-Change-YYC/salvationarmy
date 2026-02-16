import { BookingInteractiveArea } from "@/app/_components/agencycomponents/agency-interactive-area";
import { CalendarUserView, ViewMode } from "@/types/types";

export default async function SchedulePage() {
  return (
    <BookingInteractiveArea initialViewMode={ViewMode.CALENDAR} viewType={CalendarUserView.ADMIN} />
  );
}
