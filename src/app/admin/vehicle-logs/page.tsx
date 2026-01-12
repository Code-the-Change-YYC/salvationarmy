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

export default function VehicleLogsPage() {
  const [showAddLogModal, setShowAddLogModal] = useState<boolean>(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      date: "",
      travelLocation: "",
      departureTime: "",
      arrivalTime: "",
      odometerStart: "",
      odometerEnd: "",
      kilometersDriven: "",
      driverName: "",
    },
    validate: {
      date: (value) => (value.trim().length > 0 ? null : "Date is required"),
      travelLocation: (value) => (value.trim().length > 0 ? null : "Travel location is required"),
      departureTime: (value) => (value.trim().length > 0 ? null : "Departure time is required"),
      arrivalTime: (value) => (value.trim().length > 0 ? null : "Arrival time is required"),
      odometerStart: (value) => (value.trim().length > 0 ? null : "Odometer start is required"),
      odometerEnd: (value) => (value.trim().length > 0 ? null : "Odometer end is required"),
      kilometersDriven: (value) =>
        value.trim().length > 0 ? null : "Kilometers driven is required",
      driverName: (value) => (value.trim().length > 0 ? null : "Driver name is required"),
    },
  });

  const handleConfirm = () => {
    const validation = form.validate();

    if (validation.hasErrors) {
      // TODO: Add notification when notifications are set up
      console.error("Form has errors");
      return;
    }

    // TODO: Add mutation to save vehicle log
    console.log("submit", form.values);
    form.reset();
    setShowAddLogModal(false);
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
            onClick={() => setShowAddLogModal(true)}
          />
        </Group>
      </Group>

      {/* Table Section */}
      <VehicleLogTableView />

      {/* Add Log Modal */}
      <Modal
        opened={showAddLogModal}
        onClose={() => {
          form.clearErrors();
          setShowAddLogModal(false);
        }}
        onConfirm={handleConfirm}
        title={
          <Box fw={600} fz="xl">
            Add a trip to the log
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
