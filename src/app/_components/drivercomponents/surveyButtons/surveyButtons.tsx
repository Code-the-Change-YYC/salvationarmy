"use client";

import { Group, Stack } from "@mantine/core";
import { useState } from "react";
import Button from "@/app/_components/common/button/Button";
import SurveyNotification from "@/app/_components/drivercomponents/surveyNotification/surveyNotification";
import { api } from "@/trpc/react";
import type { Booking, Survey } from "@/types/types";

type SurveyViewToggleProps = {
  initialBookings: Booking[];
  initialSurveys: Survey[];
};

type View = "pending" | "completed";

export default function SurveyViewToggle({
  initialBookings,
  initialSurveys,
}: SurveyViewToggleProps) {
  const [activeView, setActiveView] = useState<View>("pending");

  // will update every 60 seconds
  const { data: surveys = [] } = api.surveys.getAll.useQuery(undefined, {
    initialData: initialSurveys,
    refetchInterval: 60000,
  });
  const { data: bookings = [] } = api.bookings.getAll.useQuery(
    { surveyCompleted: false },
    {
      initialData: initialBookings,
      refetchInterval: 60000,
    },
  );

  return (
    <>
      <Group justify="space-between" className="border-bottom">
        <Group mb="md">
          <Button
            text="Pending"
            variant={activeView === "pending" ? "primary" : "secondary"}
            onClick={() => setActiveView("pending")}
          />
          <Button
            text="Completed"
            variant={activeView === "completed" ? "primary" : "secondary"}
            onClick={() => setActiveView("completed")}
          />
        </Group>
      </Group>

      <Stack>
        {activeView === "pending"
          ? bookings.map((booking: Booking) => (
              <SurveyNotification
                key={`booking-${booking.id}`}
                survey={
                  {
                    createdAt: new Date(booking.startTime),
                    timeOfDeparture: new Date(booking.startTime),
                    timeOfArrival: new Date(booking.endTime),
                    destinationAddress: booking.destinationAddress,
                    bookingId: booking.id,
                    driverId: booking.driverId, // there should hopefully always be an assigned driver...
                    passengerInfo: booking.passengerInfo,
                  } as Survey // TODO: remove
                }
              />
            ))
          : surveys.map((survey) => (
              <SurveyNotification key={`survey-${survey.id}`} survey={survey} completed />
            ))}
      </Stack>
    </>
  );
}
