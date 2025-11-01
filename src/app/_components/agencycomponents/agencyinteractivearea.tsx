"use client";

import { ViewController } from "@/app/_components/agencycomponents/viewcontroller";
import { ViewMode } from "@/types/types";
import React, { useState } from "react";
import styles from "./agency-interactive-area.module.scss";

interface Props {
  initialViewMode?: ViewMode;
}

export const AgencyInteractiveArea = ({ initialViewMode = ViewMode.CALENDAR }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  return (
    <>
      <ViewController viewMode={viewMode} setViewMode={setViewMode} />

      <div className={styles.calendarContainer}>
        {viewMode === ViewMode.CALENDAR ? (
          <div>calendar will be here</div>
        ) : (
          <div>ag grid table will be here</div>
        )}
      </div>
    </>
  );
};
