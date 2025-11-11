"use client";

import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Box, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import Check from "../../assets/icons/check";
import Cross from "../../assets/icons/cross";
import styles from "./calendar-view.module.scss";

// Event data type
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  extendedProps?: {
    address?: string;
    status?: "confirmed" | "pending" | "cancelled";
    driver?: string;
    notes?: string;
  };
}

// Sample data for demonstration - First week of November 2025
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "123 Somestreet SW",
    start: "2025-11-03T09:00:00",
    end: "2025-11-03T10:00:00",
    color: "#BFBFBF",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "confirmed",
      driver: "John Doe",
      notes: "Regular pickup",
    },
  },
  {
    id: "2",
    title: "123 Somestreet SW",
    start: "2025-11-03T11:45:00",
    end: "2025-11-03T13:30:00",
    color: "#BFBFBF",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "confirmed",
      driver: "Jane Smith",
      notes: "Large donation pickup",
    },
  },
  {
    id: "3",
    title: "123 Somestreet SW",
    start: "2025-11-03T13:00:00",
    end: "2025-11-03T14:00:00",
    color: "#BFBFBF",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "cancelled",
      driver: "Mike Johnson",
      notes: "Cancelled by donor",
    },
  },
  {
    id: "4",
    title: "123 Somestreet SW",
    start: "2025-11-04T09:30:00",
    end: "2025-11-04T11:00:00",
    color: "#BFBFBF",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "confirmed",
      driver: "Sarah Wilson",
      notes: "Furniture pickup",
    },
  },
  {
    id: "5",
    title: "123 Somestreet SW",
    start: "2025-11-04T12:30:00",
    end: "2025-11-04T14:00:00",
    color: "#BFBFBF",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "confirmed",
      driver: "Tom Brown",
      notes: "Clothing donation",
    },
  },
  {
    id: "6",
    title: "123 Somestreet SW",
    start: "2025-11-04T14:30:00",
    end: "2025-11-04T16:00:00",
    color: "#BFBFBF",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "confirmed",
      driver: "Lisa Davis",
      notes: "Household items",
    },
  },
  {
    id: "7",
    title: "123 Somestreet SW",
    start: "2025-11-05T09:30:00",
    end: "2025-11-05T11:00:00",
    color: "#A03145",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "confirmed",
      driver: "Robert Taylor",
      notes: "Electronics pickup",
    },
  },
  {
    id: "8",
    title: "123 Somestreet SW",
    start: "2025-11-05T11:30:00",
    end: "2025-11-05T13:00:00",
    color: "#A03145",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "confirmed",
      driver: "Emily Clark",
      notes: "Books and media",
    },
  },
  {
    id: "9",
    title: "123 Somestreet SW",
    start: "2025-11-05T12:30:00",
    end: "2025-11-05T14:00:00",
    color: "#A03145",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "pending",
      driver: "David Miller",
      notes: "Large furniture",
    },
  },
  {
    id: "10",
    title: "123 Somestreet SW",
    start: "2025-11-06T09:30:00",
    end: "2025-11-06T11:00:00",
    color: "#375A87",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "cancelled",
      driver: "Anna Garcia",
      notes: "Kitchen items",
    },
  },
  {
    id: "11",
    title: "123 Somestreet SW",
    start: "2025-11-06T11:30:00",
    end: "2025-11-06T12:30:00",
    color: "#375A87",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "confirmed",
      driver: "Chris Lee",
      notes: "Small appliances",
    },
  },
  {
    id: "12",
    title: "123 Somestreet SW",
    start: "2025-11-06T12:30:00",
    end: "2025-11-06T13:30:00",
    color: "#375A87",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "confirmed",
      driver: "Maria Rodriguez",
      notes: "Bedding and linens",
    },
  },
  {
    id: "13",
    title: "123 Somestreet SW",
    start: "2025-11-06T15:00:00",
    end: "2025-11-06T16:00:00",
    color: "#375A87",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "pending",
      driver: "James Wilson",
      notes: "Toys and games",
    },
  },
  {
    id: "14",
    title: "123 Somestreet SW",
    start: "2025-11-07T08:30:00",
    end: "2025-11-07T10:00:00",
    color: "#375A87",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "pending",
      driver: "Jennifer Martinez",
      notes: "Early morning pickup",
    },
  },
  {
    id: "15",
    title: "123 Somestreet SW",
    start: "2025-11-07T10:00:00",
    end: "2025-11-07T11:00:00",
    color: "#375A87",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "pending",
      driver: "Kevin Thompson",
      notes: "Office supplies",
    },
  },
  {
    id: "16",
    title: "123 Somestreet SW",
    start: "2025-11-07T11:30:00",
    end: "2025-11-07T12:30:00",
    color: "#375A87",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "pending",
      driver: "Rachel Green",
      notes: "Art and decorations",
    },
  },
  {
    id: "17",
    title: "123 Somestreet SW",
    start: "2025-11-07T13:30:00",
    end: "2025-11-07T15:00:00",
    color: "#375A87",
    extendedProps: {
      address: "123 Somestreet SW",
      status: "pending",
      driver: "Mark Johnson",
      notes: "Large donation - multiple items",
    },
  },
];

interface CalendarViewProps {
  events?: CalendarEvent[];
  currentDate?: Date;
  setIsDayView?: (isDayView: boolean) => void;
}

export default function CalendarView({
  events = sampleEvents, // Remove this once we have real events
  currentDate,
  setIsDayView,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size for responsive view using media query
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    const initialIsMobile = mediaQuery.matches;
    setIsMobile(initialIsMobile);

    // Notify parent of initial view state
    if (setIsDayView) {
      setIsDayView(initialIsMobile);
    }

    // Listen for changes
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [setIsDayView]);

  // Update calendar date when currentDate prop changes
  useEffect(() => {
    if (currentDate && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      // defer the change date to avoid flushSync error
      setTimeout(() => {
        calendarApi.gotoDate(currentDate);
      }, 0);
    }
  }, [currentDate]);

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
      extendedProps.address ? `Address: ${extendedProps.address}` : "",
      extendedProps.status ? `Status: ${extendedProps.status}` : "",
      extendedProps.driver ? `Driver: ${extendedProps.driver}` : "",
      extendedProps.notes ? `Notes: ${extendedProps.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    alert(alertMessage);
  };

  // Custom event content renderer
  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = eventInfo.event;
    const extendedProps = event.extendedProps;
    const status = extendedProps.status;

    // Status icons
    const getStatusIcon = () => {
      switch (status) {
        case "confirmed":
          return <Check width="12px" height="12px" />;
        case "cancelled":
          return <Cross width="12px" height="12px" />;
        default:
          return null;
      }
    };

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
          <Box>{getStatusIcon()}</Box>
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
        initialDate={currentDate}
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
