"use client";

import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Box, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useMemo, useRef } from "react";
import Check from "../../assets/icons/check";
import Cross from "../../assets/icons/cross";
import type { CalendarBooking, CalendarEvent } from "../../types/types";
import { BookingStatus } from "../../types/types";
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

function transformBookingsToEvents(bookings: CalendarBooking[]): CalendarEvent[] {
  return bookings.map((booking) => ({
    id: String(booking.id),
    title: booking.title,
    start: booking.start,
    end: booking.end,
    color: getEventColor(booking.start),
    extendedProps: {
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      purpose: booking.purpose,
      passengerInfo: booking.passengerInfo,
      status: booking.status,
      agencyId: booking.agencyId,
      driverId: booking.driverId,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    },
  }));
}

// Sample bookings for demonstration
const sampleBookings: CalendarBooking[] = [
  {
    id: "1",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "456 Main St",
    passengerInfo: "John Doe",
    status: BookingStatus.COMPLETED,
    agencyId: "agency-1",
    driverId: "driver-1",
    purpose: "Regular pickup",
    start: "2025-11-10T09:00:00",
    end: "2025-11-10T10:00:00",
  },
  {
    id: "2",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "789 Oak Ave",
    passengerInfo: "Jane Smith",
    status: BookingStatus.COMPLETED,
    agencyId: "agency-1",
    driverId: "driver-2",
    purpose: "Large donation pickup",
    start: "2025-11-10T11:45:00",
    end: "2025-11-10T13:30:00",
  },
  {
    id: "3",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "321 Elm St",
    passengerInfo: "Mike Johnson",
    status: BookingStatus.INCOMPLETE,
    agencyId: "agency-1",
    driverId: "driver-3",
    purpose: "Cancelled by donor",
    start: "2025-11-10T13:00:00",
    end: "2025-11-10T14:00:00",
  },
  {
    id: "4",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "654 Pine Rd",
    passengerInfo: "Sarah Wilson",
    status: BookingStatus.COMPLETED,
    agencyId: "agency-1",
    driverId: "driver-4",
    purpose: "Furniture pickup",
    start: "2025-11-11T09:30:00",
    end: "2025-11-11T11:00:00",
  },
  {
    id: "5",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "987 Maple Dr",
    passengerInfo: "Tom Brown",
    status: BookingStatus.COMPLETED,
    agencyId: "agency-1",
    driverId: "driver-5",
    purpose: "Clothing donation",
    start: "2025-11-11T12:30:00",
    end: "2025-11-11T14:00:00",
  },
  {
    id: "6",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "147 Cedar Ln",
    passengerInfo: "Lisa Davis",
    status: BookingStatus.COMPLETED,
    agencyId: "agency-1",
    driverId: "driver-6",
    purpose: "Household items",
    start: "2025-11-11T14:30:00",
    end: "2025-11-11T16:00:00",
  },
  {
    id: "7",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "258 Birch Way",
    passengerInfo: "Robert Taylor",
    status: BookingStatus.COMPLETED,
    agencyId: "agency-2",
    driverId: "driver-7",
    purpose: "Electronics pickup",
    start: "2025-11-12T09:30:00",
    end: "2025-11-12T11:00:00",
  },
  {
    id: "8",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "369 Spruce Ct",
    passengerInfo: "Emily Clark",
    status: BookingStatus.COMPLETED,
    agencyId: "agency-2",
    driverId: "driver-8",
    purpose: "Books and media",
    start: "2025-11-12T11:30:00",
    end: "2025-11-12T13:00:00",
  },
  {
    id: "9",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "741 Willow St",
    passengerInfo: "David Miller",
    status: BookingStatus.IN_PROGRESS,
    agencyId: "agency-2",
    driverId: "driver-9",
    purpose: "Large furniture",
    start: "2025-11-12T12:30:00",
    end: "2025-11-12T14:00:00",
  },
  {
    id: "10",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "852 Ash Blvd",
    passengerInfo: "Anna Garcia",
    status: BookingStatus.INCOMPLETE,
    agencyId: "agency-3",
    driverId: "driver-10",
    purpose: "Kitchen items",
    start: "2025-11-13T09:30:00",
    end: "2025-11-13T11:00:00",
  },
  {
    id: "11",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "963 Poplar Ave",
    passengerInfo: "Chris Lee",
    status: BookingStatus.COMPLETED,
    agencyId: "agency-3",
    driverId: "driver-11",
    purpose: "Small appliances",
    start: "2025-11-13T11:30:00",
    end: "2025-11-13T12:30:00",
  },
  {
    id: "12",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "159 Fir St",
    passengerInfo: "Maria Rodriguez",
    status: BookingStatus.COMPLETED,
    agencyId: "agency-3",
    driverId: "driver-12",
    purpose: "Bedding and linens",
    start: "2025-11-13T12:30:00",
    end: "2025-11-13T13:30:00",
  },
  {
    id: "13",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "357 Hemlock Rd",
    passengerInfo: "James Wilson",
    status: BookingStatus.IN_PROGRESS,
    agencyId: "agency-3",
    driverId: "driver-13",
    purpose: "Toys and games",
    start: "2025-11-13T15:00:00",
    end: "2025-11-13T16:00:00",
  },
  {
    id: "14",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "468 Juniper Dr",
    passengerInfo: "Jennifer Martinez",
    status: BookingStatus.IN_PROGRESS,
    agencyId: "agency-3",
    driverId: "driver-14",
    purpose: "Early morning pickup",
    start: "2025-11-14T08:30:00",
    end: "2025-11-14T10:00:00",
  },
  {
    id: "15",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "579 Cypress Ln",
    passengerInfo: "Kevin Thompson",
    status: BookingStatus.IN_PROGRESS,
    agencyId: "agency-3",
    driverId: "driver-15",
    purpose: "Office supplies",
    start: "2025-11-14T10:00:00",
    end: "2025-11-14T11:00:00",
  },
  {
    id: "16",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "680 Redwood Way",
    passengerInfo: "Rachel Green",
    status: BookingStatus.IN_PROGRESS,
    agencyId: "agency-3",
    driverId: "driver-16",
    purpose: "Art and decorations",
    start: "2025-11-14T11:30:00",
    end: "2025-11-14T12:30:00",
  },
  {
    id: "17",
    title: "123 Somestreet SW",
    pickupLocation: "123 Somestreet SW",
    dropoffLocation: "791 Sequoia Ct",
    passengerInfo: "Mark Johnson",
    status: BookingStatus.IN_PROGRESS,
    agencyId: "agency-3",
    driverId: "driver-17",
    purpose: "Large donation - multiple items",
    start: "2025-11-14T13:30:00",
    end: "2025-11-14T15:00:00",
  },
];

interface CalendarViewProps {
  bookings?: CalendarBooking[];
  currentDate?: Date;
  setIsDayView?: (isDayView: boolean) => void;
}

export default function CalendarView({
  bookings = sampleBookings, // Remove this once we have real bookings
  currentDate,
  setIsDayView,
}: CalendarViewProps) {
  // Transform bookings to FullCalendar events
  const events = useMemo(() => transformBookingsToEvents(bookings), [bookings]);
  const calendarRef = useRef<FullCalendar>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const initialDate = getInitialDate(currentDate);

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
      extendedProps.pickupLocation ? `Pickup: ${extendedProps.pickupLocation}` : "",
      extendedProps.dropoffLocation ? `Dropoff: ${extendedProps.dropoffLocation}` : "",
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
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
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
    <div className={styles.calendarWrapper}>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin]}
        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
        initialDate={initialDate}
        headerToolbar={false}
        events={events}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        slotMinTime="08:00:00"
        slotMaxTime="19:00:00"
        slotDuration="01:00:00"
        slotLabelFormat={{
          hour: "numeric",
          hour12: true,
        }}
        dayHeaderFormat={{
          weekday: "short",
          day: "numeric",
        }}
        dayHeaderContent={(arg) => (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              {arg.text.split(" ")[1]}
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {arg.text.split(" ")[0]}
            </div>
          </div>
        )}
        allDaySlot={false}
        expandRows={true}
        nowIndicator={true}
        scrollTime="09:00:00"
        firstDay={1}
        height={700}
        weekends={false}
      />
    </div>
  );
}
