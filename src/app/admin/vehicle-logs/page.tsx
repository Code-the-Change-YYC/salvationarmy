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
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<VehicleLogData | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      date: null as Date | null,
      travelLocation: "",
      departureTime: null as Date | null,
      arrivalTime: null as Date | null,
      odometerStart: "",
      odometerEnd: "",
      kilometersDriven: "",
      driverName: "",
    },
    validate: {
      date: (value) => (value ? null : "Date is required"),
      travelLocation: (value) => (value.trim().length > 0 ? null : "Travel location is required"),
      departureTime: (value) => (value ? null : "Departure time is required"),
      arrivalTime: (value) => (value ? null : "Arrival time is required"),
      odometerStart: (value) => (value.trim().length > 0 ? null : "Odometer start is required"),
      odometerEnd: (value) => (value.trim().length > 0 ? null : "Odometer end is required"),
      kilometersDriven: (value) =>
        value.trim().length > 0 ? null : "Kilometers driven is required",
      driverName: (value) => (value.trim().length > 0 ? null : "Driver name is required"),
    },
  });

  const handleOpenCreateModal = () => {
    setEditingLog(null);
    form.reset();
    setShowLogModal(true);
  };

  const handleOpenEditModal = (log: VehicleLogData) => {
    setEditingLog(log);
    form.setValues({
      date: new Date(log.DATE),
      travelLocation: log.DESTINATION,
      departureTime: new Date(log.DEPARTURE_TIME),
      arrivalTime: new Date(log.ARRIVAL_TIME),
      odometerStart: log.ODOMETER_START.toString(),
      odometerEnd: log.ODOMETER_END.toString(),
      kilometersDriven: log.KM_DRIVEN.toString(),
      driverName: log.DRIVER,
    });
    setShowLogModal(true);
  };

  const handleConfirm = () => {
    const validation = form.validate();

    if (validation.hasErrors) {
      // TODO: Add notification when notifications are set up
      console.error("Form has errors");
      return;
    }

    if (editingLog) {
      // TODO: Add mutation to update vehicle log
      console.log("update log", form.values);
    } else {
      // TODO: Add mutation to create vehicle log
      console.log("create log", form.values);
    }

    form.reset();
    setEditingLog(null);
    setShowLogModal(false);
  };

  return (
    <Stack gap="lg" p="md">
      {/* Header Section */}
      <Title order={2}>Vehicle Logs</Title>

      <Group justify="space-between" align="center">
        <Group>
          <Button text="Ford Expedition CTW 2276" variant="secondary" />
          <Button text="Optimus Prime" variant="secondary" />
        </Group>

        <Group>
          {/* TODO: add export to csv functionality to this button */}
          <Button text="Export to CSV File" variant="secondary" icon={<Grid />} />
          <Button
            text="Add to Log"
            variant="primary"
            icon={<Plus />}
            onClick={handleOpenCreateModal}
          />
        </Group>
      </Group>

      {/* Table Section */}
      <VehicleLogTableView onRowClick={handleOpenEditModal} />

      {/* Add/Edit Log Modal */}
      <Modal
        opened={showLogModal}
        onClose={() => {
          form.clearErrors();
          setEditingLog(null);
          setShowLogModal(false);
        }}
        onConfirm={handleConfirm}
        title={
          <Box fw={600} fz="xl">
            {editingLog ? "View/Edit Drive Log" : "Add a trip to the log"}
          </Box>
        }
        size="lg"
        showDefaultFooter
        confirmText="Save Changes"
        cancelText="Cancel"
      >
        <VehicleLogForm form={form} />
      </Modal>
    </Stack>
  );
}
