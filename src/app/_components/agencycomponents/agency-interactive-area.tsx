"use client";

import { AgencyForm } from "@/app/_components/agencycomponents/agency-form";
import { ViewController } from "@/app/_components/agencycomponents/view-controller";
import { ViewMode } from "@/types/types";
import React, { useState } from "react";
import styles from "./agency-interactive-area.module.scss";

interface Props {
  initialViewMode?: ViewMode;
}

export const AgencyInteractiveArea = ({ initialViewMode = ViewMode.CALENDAR }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);

  return (
    <>
      <ViewController
        setShowBookingModal={setShowBookingModal}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className={styles.calendarContainer}>
        {viewMode === ViewMode.CALENDAR ? (
          <div>calendar will be here</div>
        ) : (
          <div>ag grid table will be here</div>
        )}
      </div>

      {showBookingModal && <AgencyForm />}
    </>
  );
};
