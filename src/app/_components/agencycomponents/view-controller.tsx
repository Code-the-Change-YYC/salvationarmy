"use client";

import Button from "@/app/_components/common/button/Button";
import SegmentedControl from "@/app/_components/common/segmentedControl";
import Calendar from "@/assets/icons/calendar";
import Chevron from "@/assets/icons/chevron";
import Grid from "@/assets/icons/grid";
import Plus from "@/assets/icons/plus";
import type { ViewMode } from "@/types/types";
import styles from "./view-controller.module.scss";

const leftViewOption = {
  value: "calendar",
  label: "Calendar View",
  icon: Calendar,
};

const rightViewOption = {
  value: "table",
  label: "Table View",
  icon: Grid,
};

import type React from "react";
import IconButton from "@/app/_components/common/button/IconButton";

interface ViewControllerProps {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  setShowBookingModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isDayView?: boolean;
}

export const ViewController = ({
  viewMode,
  setViewMode,
  setShowBookingModal,
  currentDate,
  onDateChange,
  isDayView = false,
}: ViewControllerProps) => {
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
      : toWeekday(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)); // Move back a week in milliseconds
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = isDayView
      ? moveWeekday(currentDate, 1)
      : toWeekday(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)); // Move forward a week in milliseconds
    onDateChange(newDate);
  };

  return (
    <div className={styles.controlsBar}>
      <div className={styles.viewToggles}>
        <SegmentedControl
          leftOption={leftViewOption}
          rightOption={rightViewOption}
          value={viewMode}
          onChange={setViewMode}
          color="black"
          size="md"
        />
      </div>
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
        <Button onClick={() => setShowBookingModal(true)} text="Add booking" icon={<Plus />} />
      </div>
    </div>
  );
};
