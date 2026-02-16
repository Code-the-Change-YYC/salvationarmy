"use client";

import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Box, Drawer, Popover } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  TABLE_SLOT_DURATION,
  TABLE_SLOT_MAX_TIME,
  TABLE_SLOT_MIN_TIME,
} from "@/constants/TableScheduleConstants";
import type { Booking, BookingStatus, CalendarEvent, CalendarUserView } from "@/types/types";

import styles from "./calendar-view.module.scss";
import EventBlock from "./event-block";
import EventDetails from "./event-details";

// Event color constants
const CHERRY_RED = "#A03145"; // Red for current day
const COBALT_BLUE = "#375A87"; // Blue for future dates
const DARK_GREY = "#434343"; // Grey for past dates

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
    return DARK_GREY;
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
  viewType?: CalendarUserView;
}

export default function CalendarView({
  bookings,
  currentDate,
  setIsDayView,
  includeButtons,
  viewType,
}: CalendarViewProps) {
  const [openedEventId, setOpenedEventId] = useState<string | null>(null);
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

  // Find the selected event for the mobile drawer
  const selectedEvent = useMemo(() => {
    if (!openedEventId) return null;
    return events.find((e) => e.id === openedEventId) ?? null;
  }, [openedEventId, events]);

  // Notify parent of view state changes
  useEffect(() => {
    if (setIsDayView) {
      setIsDayView(isMobile ?? false);
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
      setIsDayView(isMobile ?? false);
    }
  }, [isMobile, setIsDayView]);

  // Custom event content renderer
  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = eventInfo.event;
    const calendarEvent = events.find((e) => e.id === event.id);
    const status = calendarEvent?.extendedProps?.status ?? null;
    const popoverOpened = openedEventId === event.id;

    const eventBlock = (
      <EventBlock
        title={event.title}
        start={event.start}
        end={event.end}
        status={status}
        showTime={!!eventInfo.timeText}
      />
    );

    // On mobile, just render the event block (drawer handles the details)
    if (isMobile) {
      return eventBlock;
    }

    // On desktop, wrap with Popover
    return (
      <Popover
        opened={popoverOpened}
        onChange={(opened) => !opened && setOpenedEventId(null)}
        width={280}
        position="left"
        shadow="md"
        clickOutsideEvents={["mousedown", "touchstart"]}
        transitionProps={{ duration: 100, transition: "pop" }}
        radius={8}
      >
        <Popover.Target>{eventBlock}</Popover.Target>
        <Popover.Dropdown>
          {calendarEvent && <EventDetails event={calendarEvent} viewType={viewType} />}
        </Popover.Dropdown>
      </Popover>
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
        eventClick={(clickInfo: EventClickArg) => {
          const eventId = clickInfo.event.id;
          setOpenedEventId((prev) => (prev === eventId ? null : eventId));
        }}
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
        scrollTime="09:00:00"
        firstDay={1}
        height={700}
        weekends={false}
      />

      <Drawer
        opened={isMobile === true && openedEventId !== null}
        onClose={() => setOpenedEventId(null)}
        position="bottom"
        size="80%"
        radius="md"
        padding="lg"
        withCloseButton={false}
        classNames={{ body: styles.drawerBody }}
      >
        {selectedEvent && <EventDetails event={selectedEvent} viewType={viewType} />}
      </Drawer>
    </Box>
  );
}
