import { AdminInteractiveArea } from "@/app/_components/admincomponents/admin-interactive-area";
import { ViewMode } from "@/types/types";

export default async function SchedulePage() {
  return <AdminInteractiveArea initialViewMode={ViewMode.CALENDAR} />;
}
