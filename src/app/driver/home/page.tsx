import CalendarView from "@/app/_components/common/calendar/calendar-view";
import { api } from "@/trpc/server";

export default async function DriverHome() {
  const initialBookings = await api.bookings.getAll();
  return (
    <main>
      <CalendarView bookings={initialBookings} includeButtons={true}></CalendarView>
    </main>
  );
}
