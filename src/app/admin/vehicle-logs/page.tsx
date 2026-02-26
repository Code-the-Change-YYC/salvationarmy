"use client";

import { Box, Group, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import Button from "@/app/_components/common/button/Button";
import Modal from "@/app/_components/common/modal/modal";
import { VehicleLogForm } from "@/app/_components/vehiclelogcomponents/vehicle-log-form";
import VehicleLogTableView, {
  type VehicleLogData,
} from "@/app/_components/vehiclelogcomponents/vehicle-log-table-view";
import Grid from "@/assets/icons/grid";
import Plus from "@/assets/icons/plus";
import { notify } from "@/lib/notifications";

export default function VehicleLogsPage() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      id: null as number | null,
      date: null as string | null,
      destination: "",
      departureTime: null as string | null,
      arrivalTime: null as string | null,
      odometerStart: "",
      odometerEnd: "",
      driver: "",
      vehicle: "",
    },

    validate: {
      date: (value) => (value ? null : "Date is required"),
      destination: (value) => (value.trim().length > 0 ? null : "Destination is required"),
      departureTime: (value) => (value ? null : "Departure time is required"),
      arrivalTime: (value) => (value ? null : "Arrival time is required"),
      odometerStart: (value) => {
        if (value.trim().length === 0) return "Odometer start is required";
        const num = Number.parseFloat(value);
        if (Number.isNaN(num)) return "Must be a valid number";
        if (num < 0) return "Must be a positive number";
        return null;
      },
      odometerEnd: (value, values) => {
        if (value.trim().length === 0) return "Odometer end is required";
        const num = Number.parseFloat(value);
        if (Number.isNaN(num)) return "Must be a valid number";
        if (num < 0) return "Must be a positive number";
        const start = Number.parseFloat(values.odometerStart);
        if (!Number.isNaN(start) && num < start) {
          return "End reading must be greater than or equal to start reading";
        }
        return null;
      },
      driver: (value) => (value.trim().length > 0 ? null : "Driver is required"),
      vehicle: (value) => (value.trim().length > 0 ? null : "Vehicle is required"),
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
      id: log.ID,
      date: log.DATE || null,
      destination: log.DESTINATION,
      departureTime: log.DEPARTURE_TIME || null,
      arrivalTime: log.ARRIVAL_TIME || null,
      odometerStart: log.ODOMETER_START.toString(),
      odometerEnd: log.ODOMETER_END.toString(),
      driver: log.DRIVER,
      vehicle: log.VEHICLE,
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
