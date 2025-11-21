"use client";

import { useForm } from "@mantine/form";
import { useState } from "react";
import { ViewController } from "@/app/_components/agencycomponents/view-controller";
import { notify } from "@/lib/notifications";
import { ViewMode } from "@/types/types";
import styles from "./admin-interactive-area.module.scss";

interface Props {
  initialViewMode?: ViewMode;
}

export const AdminInteractiveArea = ({ initialViewMode = ViewMode.CALENDAR }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [_showBookingModal, setShowBookingModal] = useState<boolean>(false);
  // eventually this loading state will be replacted with a tanstack mutation loading state
  const [_loading, setLoading] = useState<boolean>(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      residentName: "",
      contactInfo: "",
      additionalInfo: "",
      transportDateTime: "",
      purpose: "",
      destinationAddress: "",
    },

    validate: {
      residentName: (value) => (value.trim().length > 0 ? null : "Resident name is required"),
      contactInfo: (value) => (value.trim().length > 0 ? null : "Contact info is required"),
      transportDateTime: (value) => (value.trim().length > 0 ? null : "Date and time is required"),
      purpose: (value) => (value.trim().length > 0 ? null : "Purpose is required"),
      destinationAddress: (value) =>
        value.trim().length > 0 ? null : "Destination address is required",
    },
  });

  // biome-ignore lint/correctness/noUnusedVariables: will delete when actually used
  const handleConfirm = () => {
    setLoading(true);
    const validation = form.validate();
    const hasErrors = Object.keys(validation.errors).length > 0;

    if (hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      setLoading(false);
      return;
    }

    const values = form.values;
    console.log("submit", values);

    // enter an actual api call here like a tanstack mutation

    setTimeout(() => {
      setLoading(false);
      setShowBookingModal(false);
      notify.success("Booking successfully created");
      form.reset();
    }, 2000);
  };

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
    </>
  );
};
