"use client";

import SegmentedControl from "@/app/_components/segmentedControl";
import Calendar from "@/assets/icons/calendar";
import Grid from "@/assets/icons/grid";

import Chevron from "@/assets/icons/chevron";
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

interface ViewControllerProps {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
}

export const ViewController = ({ viewMode, setViewMode }: ViewControllerProps) => {
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
          <Chevron rotation="left" />
          <span>This week</span>
          <Chevron rotation="right" />
        </div>
        <div>button here once ethan done</div>
      </div>
    </div>
  );
};
