"use client";

import SegmentedControl from "@/app/_components/segmentedControl";
import Calendar from "@/assets/icons/calendar";
import Grid from "@/assets/icons/grid";

import Button from "@/app/_components/Button";
import Chevron from "@/assets/icons/chevron";
import Plus from "@/assets/icons/plus";
import type { ViewMode } from "@/types/types";
import IconButton from "../IconButton";
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

interface ViewControllerProps {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  setShowBookingModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const ViewController = ({
  viewMode,
  setViewMode,
  setShowBookingModal,
  currentDate,
  onDateChange,
}: ViewControllerProps) => {
  // Get the start of the week (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const weekStart = new Date(d);
    weekStart.setDate(diff);
    return weekStart;
  };

  // Get the end of the week (Sunday)
  const getWeekEnd = (date: Date): Date => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd;
  };

  // Format week range text
  const formatWeekRange = (date: Date): string => {
    const weekStart = getWeekStart(date);
    const weekEnd = getWeekEnd(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(weekStart);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(weekEnd);
    endDate.setHours(0, 0, 0, 0);

    // Check if this is the current week
    if (startDate <= today && today <= endDate) {
      return "This week";
    }

    // Format date range
    const formatDate = (d: Date): string => {
      const month = d.toLocaleDateString("en-US", { month: "short" });
      const day = d.getDate();
      return `${month} ${day}`;
    };

    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  // Navigate to previous week
  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  // Navigate to next week
  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
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
            onClick={handlePreviousWeek}
            ariaLabel="Previous week"
            transparent
          />
          <span>{formatWeekRange(currentDate)}</span>
          <IconButton
            icon={<Chevron rotation="right" />}
            onClick={handleNextWeek}
            ariaLabel="Next week"
            transparent
          />
        </div>
        <Button onClick={() => setShowBookingModal(true)} text="Add booking" icon={<Plus />} />
      </div>
    </div>
  );
};
