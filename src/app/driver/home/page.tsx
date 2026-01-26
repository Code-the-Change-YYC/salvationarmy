import CalendarView from "@/app/_components/common/calendar/calendar-view";
import Navbar from "@/app/_components/common/navbar";
import { requireRole } from "@/lib/auth-helpers";
import { api, HydrateClient } from "@/trpc/server";
import { type Booking, Role } from "@/types/types";
import styles from "./index.module.css";

export default async function DriverHome() {
  const session = await requireRole([Role.ADMIN, Role.DRIVER]);
  const hello = await api.form.hello({ text: "from tRPC" });
  const testBookings: Booking[] = [
    {
      id: 5,
      title: "test",
      pickupAddress: "address",
      destinationAddress: "destination",
      purpose: "testing",
      passengerInfo: "info",
      phoneNumber: "81394954",
      status: "incomplete",
      agencyId: "34",
      //Test data seeded on January 13
      startTime: "2026-01-13T11:00:00-05:00",
      endTime: "2026-01-13T13:30:00-05:00",
      driverId: "423",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "testUser",
      updatedBy: "testUser",
    },
  ];

  if (session?.user) {
    void api.form.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <Navbar view="driver" />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Driver home page</h1>
          <p className={styles.showcaseText}>{hello ? hello.greeting : "Loading tRPC query..."}</p>
          <p className={styles.showcaseText}>
            {session && <span>Logged in as {session.user?.name}</span>}
          </p>
        </div>
        <CalendarView bookings={testBookings} includeButtons={true}></CalendarView>
      </main>
    </HydrateClient>
  );
}
