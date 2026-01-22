"use client";

import dayjs, { type Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isToday from "dayjs/plugin/isToday";
import type React from "react";
import Button from "@/app/_components/common/button/Button";
import IconButton from "@/app/_components/common/button/IconButton";
import SegmentedControl from "@/app/_components/common/segmentedControl";
import Calendar from "@/assets/icons/calendar";
import Chevron from "@/assets/icons/chevron";
import Grid from "@/assets/icons/grid";
import Plus from "@/assets/icons/plus";
import type { ViewMode } from "@/types/types";
import styles from "./view-controller.module.scss";

dayjs.extend(isoWeek);
dayjs.extend(isToday);

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

interface ViewControllerProps {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  setShowBookingModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isDayView?: boolean;
}

// Adjust weekend to nearest weekday (Sun -> Mon, Sat -> Fri)
const toWeekday = (d: Dayjs): Dayjs => {
  if (d.day() === 0) return d.add(1, "day");
  if (d.day() === 6) return d.subtract(1, "day");
  return d;
};

// Move to next/previous weekday, skipping weekends
const moveWeekday = (d: Dayjs, direction: 1 | -1): Dayjs => {
  let result = d.add(direction, "day");
  while (result.day() === 0 || result.day() === 6) {
    result = result.add(direction, "day");
  }
  return result;
};

export const ViewController = ({
  viewMode,
  setViewMode,
  setShowBookingModal,
  currentDate,
  onDateChange,
  isDayView = false,
}: ViewControllerProps) => {
  const formatDateDisplay = (): string => {
    const d = toWeekday(dayjs(currentDate));

    if (isDayView) {
      if (d.isToday()) return "Today";
      return d.format("ddd, MMM D");
    }

    // Week view: Monday to Friday
    const weekStart = d.isoWeekday(1); // Monday
    const weekEnd = weekStart.add(4, "day"); // Friday
    const today = dayjs().startOf("day");

    if (
      (today.isAfter(weekStart) || today.isSame(weekStart, "day")) &&
      (today.isBefore(weekEnd) || today.isSame(weekEnd, "day"))
    ) {
      return "This week";
    }

    return `${weekStart.format("MMM D")} - ${weekEnd.format("MMM D")}`;
  };

  const handlePrevious = () => {
    const current = dayjs(currentDate);
    const newDate = isDayView ? moveWeekday(current, -1) : toWeekday(current.subtract(1, "week"));
    onDateChange(newDate.toDate());
  };

  const handleNext = () => {
    const current = dayjs(currentDate);
    const newDate = isDayView ? moveWeekday(current, 1) : toWeekday(current.add(1, "week"));
    onDateChange(newDate.toDate());
  };

  return (
    <div className={styles.controlsBar}>
      <div className={styles.leftControls}>
        <SegmentedControl
          leftOption={leftViewOption}
          rightOption={rightViewOption}
          value={viewMode}
          onChange={setViewMode}
          color="black"
          size="md"
          hideLabelsOnMobile
        />
        <div className={styles.addButtonMobile}>
          <IconButton
            icon={<Plus />}
            onClick={() => setShowBookingModal(true)}
            ariaLabel="Add booking"
          />
        </div>
      </div>
      <div className={styles.rightControls}>
        <div className={styles.weekNavigation}>
          <IconButton
            icon={<Chevron rotation="left" />}
            onClick={handlePrevious}
            ariaLabel={isDayView ? "Previous day" : "Previous week"}
            transparent
          />
          <span>{formatDateDisplay()}</span>
          <IconButton
            icon={<Chevron rotation="right" />}
            onClick={handleNext}
            ariaLabel={isDayView ? "Next day" : "Next week"}
            transparent
          />
        </div>
        <div className={styles.addButtonDesktop}>
          <Button onClick={() => setShowBookingModal(true)} text="Add booking" icon={<Plus />} />
        </div>
      </div>
    </div>
  );
};
