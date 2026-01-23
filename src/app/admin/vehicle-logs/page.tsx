"use client";

import { Box, Group, Stack, Title } from "@mantine/core";
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

  // Simple state instead of Mantine form
  const [date, setDate] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [odometerStart, setOdometerStart] = useState("");
  const [odometerEnd, setOdometerEnd] = useState("");
  const [driver, setDriver] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetFields = () => {
    setDate("");
    setDestination("");
    setDepartureTime("");
    setArrivalTime("");
    setOdometerStart("");
    setOdometerEnd("");
    setDriver("");
    setErrors({});
  };

  const handleAddToLog = () => {
    setIsEditMode(false);
    resetFields();
    setShowModal(true);
  };

  const handleRowClick = (log: VehicleLogData) => {
    setIsEditMode(true);
    setDate(log.DATE);
    setDestination(log.DESTINATION);
    setDepartureTime(log.DEPARTURE_TIME);
    setArrivalTime(log.ARRIVAL_TIME);
    setOdometerStart(log.ODOMETER_START.toString());
    setOdometerEnd(log.ODOMETER_END.toString());
    setDriver(log.DRIVER);
    setErrors({});
    setShowModal(true);
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!date.trim()) newErrors.date = "Date is required";
    if (!destination.trim()) newErrors.destination = "Destination is required";
    if (!departureTime.trim()) newErrors.departureTime = "Departure time is required";
    if (!arrivalTime.trim()) newErrors.arrivalTime = "Arrival time is required";
    if (!odometerStart.trim()) newErrors.odometerStart = "Odometer start is required";
    if (!odometerEnd.trim()) newErrors.odometerEnd = "Odometer end is required";
    if (!driver.trim()) newErrors.driver = "Driver is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    setLoading(true);

    if (!validateFields()) {
      notify.error("Please fix the errors in the form before submitting");
      setLoading(false);
      return;
    }

    const values = {
      date,
      destination,
      departureTime,
      arrivalTime,
      odometerStart,
      odometerEnd,
      driver,
    };
    console.log(isEditMode ? "edit" : "add", values);

    // TODO: Call tRPC mutation to save vehicle log

    setTimeout(() => {
      setLoading(false);
      setShowModal(false);
      notify.success(
        isEditMode ? "Vehicle log updated successfully" : "Vehicle log added successfully",
      );
      resetFields();
    }, 2000);
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
          <Button text="Add to Log" variant="primary" icon={<Plus />} onClick={handleAddToLog} />
        </Group>
      </Group>

      {/* Table Section */}
      <VehicleLogTableView onRowClick={handleRowClick} />

      {/* Modal */}
      <Modal
        opened={showModal}
        onClose={() => {
          resetFields();
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
        <VehicleLogForm
          date={date}
          setDate={setDate}
          destination={destination}
          setDestination={setDestination}
          departureTime={departureTime}
          setDepartureTime={setDepartureTime}
          arrivalTime={arrivalTime}
          setArrivalTime={setArrivalTime}
          odometerStart={odometerStart}
          setOdometerStart={setOdometerStart}
          odometerEnd={odometerEnd}
          setOdometerEnd={setOdometerEnd}
          driver={driver}
          setDriver={setDriver}
          errors={errors}
        />
      </Modal>
    </Stack>
  );
}
