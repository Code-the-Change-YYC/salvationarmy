"use client";

import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Box, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useMemo, useRef } from "react";
import {
  TABLE_SLOT_DURATION,
  TABLE_SLOT_MAX_TIME,
  TABLE_SLOT_MIN_TIME,
} from "@/constants/TableScheduleConstants";
import Check from "../../../assets/icons/check";
import Cross from "../../../assets/icons/cross";
import { type Booking, BookingStatus, type CalendarEvent } from "../../../types/types";
import styles from "./calendar-view.module.scss";

// Event color constants
const CHERRY_RED = "#A03145"; // Red for current day
const COBALT_BLUE = "#375A87"; // Blue for future dates
const LIGHT_GREY = "#BFBFBF"; // Grey for past dates

// Get the initial date, adjusting Sunday to the next Monday
function getInitialDate(date?: Date): Date {
  const targetDate = date || new Date();
  const dateCopy = new Date(targetDate);
  dateCopy.setHours(0, 0, 0, 0); // Reset to start of day for comparison

  // If the date is Sunday (getDay() === 0), move to next Monday
  if (dateCopy.getDay() === 0) {
    dateCopy.setDate(dateCopy.getDate() + 1);
  }

  return dateCopy;
}

// Get color based on event date: past = grey, today = red, future = blue
function getEventColor(startDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day for comparison

  const eventDate = new Date(startDate);
  eventDate.setHours(0, 0, 0, 0); // Reset to start of day for comparison

  if (eventDate < today) {
    return LIGHT_GREY;
  }
  if (eventDate.getTime() === today.getTime()) {
    return CHERRY_RED;
  }
  return COBALT_BLUE;
}

function transformBookingsToEvents(bookingsList: Booking[]): CalendarEvent[] {
  return bookingsList.map((booking) => ({
    id: String(booking.id),
    title: booking.title,
    start: booking.startTime,
    end: booking.endTime,
    color: getEventColor(booking.startTime),
    extendedProps: {
      pickupAddress: booking.pickupAddress,
      destinationAddress: booking.destinationAddress,
      purpose: booking.purpose,
      passengerInfo: booking.passengerInfo,
      status: booking.status as BookingStatus,
      agencyId: booking.agencyId,
      driverId: booking.driverId,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    },
  }));
}

interface CalendarViewProps {
  bookings: Booking[];
  currentDate?: Date;
  setIsDayView?: (isDayView: boolean) => void;
  includeButtons?: boolean;
}

export default function CalendarView({
  bookings,
  currentDate,
  setIsDayView,
  includeButtons,
}: CalendarViewProps) {
  const events = useMemo(() => transformBookingsToEvents(bookings ?? []), [bookings]);
  const calendarRef = useRef<FullCalendar>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const initialDate = getInitialDate(currentDate);
  const toolbar = includeButtons
    ? {
        left: "",
        center: "title",
        right: "prev,next",
      }
    : false;

  // Notify parent of view state changes
  useEffect(() => {
    if (setIsDayView) {
      setIsDayView(isMobile);
    }
  }, [isMobile, setIsDayView]);

  // Update calendar date when currentDate prop changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      // defer the change date to avoid flushSync error
      setTimeout(() => {
        calendarApi.gotoDate(initialDate);
      }, 0);
    }
  }, [initialDate]);

  // Update calendar view when screen size changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const currentView = calendarApi.view.type;
      const targetView = isMobile ? "timeGridDay" : "timeGridWeek";

      // Only change view if it's different from current view
      if (currentView !== targetView) {
        // defer the change view to avoid flushSync error
        setTimeout(() => {
          calendarApi.changeView(targetView);
        }, 0);
      }
    }
    // Notify parent of view change
    if (setIsDayView) {
      setIsDayView(isMobile);
    }
  }, [isMobile, setIsDayView]);

  // Handle event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps;

    // Format the event details for display
    const startTime = event.start
      ? new Date(event.start).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "N/A";
    const endTime = event.end
      ? new Date(event.end).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "N/A";

    const alertMessage = [
      `Title: ${event.title}`,
      `Time: ${startTime} - ${endTime}`,
      extendedProps.pickupAddress ? `Pickup: ${extendedProps.pickupAddress}` : "",
      extendedProps.destinationAddress ? `Dropoff: ${extendedProps.destinationAddress}` : "",
      extendedProps.status ? `Status: ${extendedProps.status}` : "",
      extendedProps.driverId ? `Driver ID: ${extendedProps.driverId}` : "",
      extendedProps.passengerInfo ? `Passenger: ${extendedProps.passengerInfo}` : "",
      extendedProps.purpose ? `Purpose: ${extendedProps.purpose}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    alert(alertMessage);
  };

  // Custom event content renderer
  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = eventInfo.event;
    const status = eventInfo.event.extendedProps.status;

    const statusIcon =
      status === BookingStatus.COMPLETED ? (
        <Check width="12px" height="12px" />
      ) : status === BookingStatus.INCOMPLETE ? (
        <Cross width="12px" height="12px" />
      ) : null;

    return (
      <Box p="0.25rem">
        <Box className={styles.eventContentContainer}>
          <Box>
            <Text fw={600} size="sm" truncate="end">
              {event.title}
            </Text>
            {eventInfo.timeText && <Text size="xs">{eventInfo.timeText}</Text>}
          </Box>
          <Box>{statusIcon}</Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box className={styles.calendarWrapper}>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin]}
        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
        initialDate={initialDate}
        headerToolbar={toolbar}
        events={events}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        slotMinTime={TABLE_SLOT_MIN_TIME}
        slotMaxTime={TABLE_SLOT_MAX_TIME}
        slotDuration={TABLE_SLOT_DURATION}
        slotLabelFormat={{
          hour: "numeric",
          hour12: true,
        }}
        dayHeaderFormat={{
          weekday: "short",
          day: "numeric",
        }}
        dayHeaderContent={(arg) => (
          <Box className={styles.dayHeaderContainer}>
            <Box className={styles.dayHeaderWeekday}>{arg.text.split(" ")[1]}</Box>
            <Box className={styles.dayHeaderDay}>{arg.text.split(" ")[0]}</Box>
          </Box>
        )}
        allDaySlot={false}
        expandRows={true}
        nowIndicator={true}
        scrollTime="09:00:00"
        firstDay={1}
        height={700}
        weekends={false}
      />
    </Box>
  );
}
