"use client";

import { Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { AgencyForm } from "@/app/_components/agencycomponents/agency-form";
import { ViewController } from "@/app/_components/agencycomponents/view-controller";
import Modal from "@/app/_components/common/modal/modal";
import { notify } from "@/lib/notifications";
import { ViewMode } from "@/types/types";
import styles from "./agency-interactive-area.module.scss";

interface Props {
  initialViewMode?: ViewMode;
}

export const AgencyInteractiveArea = ({ initialViewMode = ViewMode.CALENDAR }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  // eventually this loading state will be replacted with a tanstack mutation loading state
  const [loading, setLoading] = useState<boolean>(false);

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

      <Modal
        opened={showBookingModal}
        onClose={() => {
          form.clearErrors();
          setShowBookingModal(false);
        }}
        onConfirm={() => {
          handleConfirm();
        }}
        title={
          <Box fw={600} fz="xl">
            Add a booking
          </Box>
        }
        size="xl"
        showDefaultFooter
        confirmText="Confirm Booking"
        loading={loading}
      >
        <AgencyForm form={form} />
      </Modal>
    </>
  );
};
