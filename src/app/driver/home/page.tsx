import { DriverBookingView } from "@/app/_components/drivercomponents/driver-booking-view";
import { HydrateClient } from "@/trpc/server";

export default async function DriverHome() {
  return (
    <HydrateClient>
      <main>
        <DriverBookingView />
      </main>
    </HydrateClient>
  );
}
