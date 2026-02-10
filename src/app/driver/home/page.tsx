"use client";

import { Alert, Box, Loader } from "@mantine/core";
import { useState } from "react";
import { ViewController } from "@/app/_components/agencycomponents/view-controller";
import CalendarView from "@/app/_components/agencypage/calendar-view";
import { api } from "@/trpc/react";
import { ViewMode } from "@/types/types";

const CHERRY_RED = "#A03145";

export default function DriverHome() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isDayView, setIsDayView] = useState<boolean>(false);
  const [viewMode] = useState<ViewMode>(ViewMode.CALENDAR);

  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError: isErrorBookings,
  } = api.bookings.getAll.useQuery();

  return (
    <main>
      <ViewController
        viewMode={viewMode}
        setViewMode={() => {}} // Driver view is calendar-only, no toggle needed
        setShowBookingModal={() => {}} // Drivers don't create bookings
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        isDayView={isDayView}
      />

      {isLoadingBookings ? (
        <Box style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <Loader color={CHERRY_RED} type="dots" />
        </Box>
      ) : isErrorBookings ? (
        <Box style={{ padding: "1rem" }}>
          <Alert variant="light" color="red">
            Failed to load bookings. Please try again later.
          </Alert>
        </Box>
      ) : (
        <CalendarView
          bookings={bookings ?? []}
          currentDate={currentDate}
          setIsDayView={setIsDayView}
        />
      )}
    </main>
  );
}
