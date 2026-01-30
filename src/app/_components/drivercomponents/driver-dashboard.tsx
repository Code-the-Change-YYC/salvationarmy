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

  const driverTrips = [{}] as Booking[];

  const tripQuery = api.bookings.getTripDetails.useQuery({
    tripID: 2,
  });

  return <></>;
};
