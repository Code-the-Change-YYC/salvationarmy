"use client";

import { Alert, Box, Loader } from "@mantine/core";
import { useState } from "react";
import IconButton from "@/app/_components/common/button/IconButton";
import Chevron from "@/assets/icons/chevron";
import { api } from "@/trpc/react";
import CalendarView from "../agencypage/calendar-view";
import styles from "./driver-booking-view.module.scss";

const CHERRY_RED = "#A03145";

export const DriverBookingView = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isDayView, setIsDayView] = useState<boolean>(false);

  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError: isErrorBookings,
  } = api.bookings.getAll.useQuery();

  // Check if a date is a weekend
  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  // Adjust a weekend day to the nearest weekday
  const toWeekday = (date: Date): Date => {
    const d = new Date(date);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday -> Monday
    if (d.getDay() === 6) d.setDate(d.getDate() - 1); // Saturday -> Friday
    return d;
  };

  // Move to next/previous weekday
  const moveWeekday = (date: Date, direction: 1 | -1): Date => {
    const d = new Date(date);
    do {
      d.setDate(d.getDate() + direction);
    } while (isWeekend(d));
    return d;
  };

  // Get Monday of the week containing the date
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1; // Sunday is 6 days from Monday
    d.setDate(d.getDate() - daysFromMonday);
    return d;
  };

  // Format date
  const formatDate = (date: Date): string => {
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return `${month} ${date.getDate()}`;
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Format date display text
  const formatDateDisplay = (date: Date): string => {
    const weekdayDate = toWeekday(new Date(date));

    if (isDayView) {
      if (isToday(weekdayDate)) return "Today";
      const weekday = weekdayDate.toLocaleDateString("en-US", {
        weekday: "short",
      });
      return `${weekday}, ${formatDate(weekdayDate)}`;
    }

    // Week view
    const weekStart = getWeekStart(weekdayDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4);

    const today = new Date();
    if (weekStart <= today && today <= weekEnd) {
      return "This week";
    }

    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = isDayView
      ? moveWeekday(currentDate, -1)
      : toWeekday(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = isDayView
      ? moveWeekday(currentDate, 1)
      : toWeekday(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    setCurrentDate(newDate);
  };

  return (
    <>
      <div className={styles.controlsBar}>
        <div className={styles.navigationControls}>
          <div className={styles.weekNavigation}>
            <IconButton
              icon={<Chevron rotation="left" />}
              onClick={handlePrevious}
              ariaLabel={isDayView ? "Previous day" : "Previous week"}
              transparent
            />
            <span>{formatDateDisplay(currentDate)}</span>
            <IconButton
              icon={<Chevron rotation="right" />}
              onClick={handleNext}
              ariaLabel={isDayView ? "Next day" : "Next week"}
              transparent
            />
          </div>
        </div>
      </div>

      <div className={styles.viewContainer}>
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
      </div>
    </>
  );
};
