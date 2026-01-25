"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { Booking } from "@/types/types";
import CalendarView from "../common/calendar/calendar-view";
import LoadingScreen from "../common/loadingscreen";
import styles from "./driver-dashboard.module.scss";

type CalendarDates = {
  startDate: string;
  endDate: string;
};

export const DriverDashboard = () => {
  const [dateJSON, setDateJSON] = useState<CalendarDates>({
    startDate: "",
    endDate: "",
  });

  let driverTrips = [{}] as Booking[];

  const tripQuery = api.bookings.getDriverTrip.useQuery(
    {
      startDate: dateJSON.startDate,
      endDate: dateJSON.endDate,
    },
    { enabled: dateJSON.startDate !== "" && dateJSON.endDate !== "" },
  );

  if (tripQuery.data) {
    //Query returned data from endpoint call
    driverTrips = tripQuery.data as Booking[];
  }

  return (
    <>
      {!tripQuery.data && <LoadingScreen message="Loading Trips..." />}

      <div className={!tripQuery.data ? styles.hiddenCalendar : undefined}>
        <CalendarView
          bookings={driverTrips}
          includeButtons={true}
          onDateChangeFunction={setDateJSON}
        />
      </div>
    </>
  );
};
