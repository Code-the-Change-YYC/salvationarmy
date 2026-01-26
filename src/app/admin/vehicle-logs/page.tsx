"use client";

import { Box, Group, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import Button from "@/app/_components/common/button/Button";
import Modal from "@/app/_components/common/modal/modal";
import { VehicleLogForm } from "@/app/_components/vehiclelogcomponents/vehicle-log-form";
import VehicleLogTableView from "@/app/_components/vehiclelogcomponents/vehicle-log-table-view";
import Grid from "@/assets/icons/grid";
import Plus from "@/assets/icons/plus";
import { notify } from "@/lib/notifications";

interface VehicleLogData {
  DATE: string;
  DESTINATION: string;
  DEPARTURE_TIME: string;
  ARRIVAL_TIME: string;
  ODOMETER_START: number;
  ODOMETER_END: number;
  KM_DRIVEN: number;
  DRIVER: string;
}

export default function VehicleLogsPage() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      date: "",
      destination: "",
      departureTime: "",
      arrivalTime: "",
      odometerStart: "",
      odometerEnd: "",
      driver: "",
    },

    validate: {
      date: (value) => (value.trim().length > 0 ? null : "Date is required"),
      destination: (value) => (value.trim().length > 0 ? null : "Destination is required"),
      departureTime: (value) => (value.trim().length > 0 ? null : "Departure time is required"),
      arrivalTime: (value) => (value.trim().length > 0 ? null : "Arrival time is required"),
      odometerStart: (value) => (value.trim().length > 0 ? null : "Odometer start is required"),
      odometerEnd: (value) => (value.trim().length > 0 ? null : "Odometer end is required"),
      driver: (value) => (value.trim().length > 0 ? null : "Driver is required"),
    },
  });

  const handleAddToLog = () => {
    setIsEditMode(false);
    form.reset();
    setShowModal(true);
  };

  const handleRowClick = (log: VehicleLogData) => {
    setIsEditMode(true);
    form.setValues({
      date: log.DATE,
      destination: log.DESTINATION,
      departureTime: log.DEPARTURE_TIME,
      arrivalTime: log.ARRIVAL_TIME,
      odometerStart: log.ODOMETER_START.toString(),
      odometerEnd: log.ODOMETER_END.toString(),
      driver: log.DRIVER,
    });
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setLoading(true);

    const validation = form.validate();
    const hasErrors = Object.keys(validation.errors).length > 0;

    if (hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      setLoading(false);
      return;
    }

    const values = form.values;
    console.log(isEditMode ? "edit" : "add", values);

    // TODO: Call tRPC mutation to save vehicle log

    setTimeout(() => {
      setLoading(false);
      setShowModal(false);
      notify.success(
        isEditMode ? "Vehicle log updated successfully" : "Vehicle log added successfully",
      );
      form.reset();
    }, 2000);
  };

  return (
    <Stack gap="lg" p="md">
      {/* Header Section */}
      <Title order={2}>Vehicle Logs</Title>

      <Group justify="flex-end" align="center">
        {/* TODO: add export to csv functionality to this button */}
        <Button text="Export to CSV File" variant="secondary" icon={<Grid />} />
        <Button text="Add to Log" variant="primary" icon={<Plus />} onClick={handleAddToLog} />
      </Group>

      {/* Table Section */}
      <VehicleLogTableView onRowClick={handleRowClick} />

      {/* Modal */}
      <Modal
        opened={showModal}
        onClose={() => {
          form.clearErrors();
          setShowModal(false);
        }}
        onConfirm={handleConfirm}
        title={
          <Box fw={600} fz="xl">
            {isEditMode ? "Edit Vehicle Log" : "Add to Log"}
          </Box>
        }
        size="xl"
        showDefaultFooter
        confirmText={isEditMode ? "Save Changes" : "Add to Log"}
        loading={loading}
      >
        <VehicleLogForm form={form} />
      </Modal>
    </Stack>
  );
}
