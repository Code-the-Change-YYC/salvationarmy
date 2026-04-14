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
import { useSession } from "@/lib/auth-client";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";

export default function VehicleLogsPage() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: session } = useSession();
  const utils = api.useUtils();

  const createLog = api.vehicleLogs.create.useMutation({
    onSuccess: () => {
      void utils.vehicleLogs.getAll.invalidate();
      setShowModal(false);
      notify.success("Vehicle log added successfully");
      form.reset();
    },
    onError: (error) => {
      notify.error(error.message ?? "Failed to add vehicle log");
    },
  });

  const updateLog = api.vehicleLogs.update.useMutation({
    onSuccess: () => {
      void utils.vehicleLogs.getAll.invalidate();
      setShowModal(false);
      notify.success("Vehicle log updated successfully");
      form.reset();
    },
    onError: (error) => {
      notify.error(error.message ?? "Failed to update vehicle log");
    },
  });

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

  const handleConfirm = () => {
    const validation = form.validate();
    const hasErrors = Object.keys(validation.errors).length > 0;

    if (hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      return;
    }

    const values = form.values;
    const odometerStart = Math.round(Number.parseFloat(values.odometerStart));
    const odometerEnd = Math.round(Number.parseFloat(values.odometerEnd));

    if (isEditMode && values.id !== null) {
      updateLog.mutate({
        id: values.id,
        date: values.date ?? undefined,
        travelLocation: values.destination || undefined,
        departureTime: values.departureTime ?? undefined,
        arrivalTime: values.arrivalTime ?? undefined,
        odometerStart,
        odometerEnd,
        driverName: values.driver || undefined,
        vehicle: values.vehicle || undefined,
      });
    } else {
      // validation already guarantees these fields are non-null;
      // capture as local consts so TypeScript can narrow the types
      if (!values.date || !values.departureTime || !values.arrivalTime) return;
      const date = values.date;
      const departureTime = values.departureTime;
      const arrivalTime = values.arrivalTime;

      createLog.mutate({
        date,
        travelLocation: values.destination,
        departureTime,
        arrivalTime,
        odometerStart,
        odometerEnd,
        driverId: session?.user.id,
        driverName: values.driver,
        vehicle: values.vehicle,
      });
    }
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
        loading={createLog.isPending || updateLog.isPending}
      >
        <VehicleLogForm form={form} />
      </Modal>
    </Stack>
  );
}
