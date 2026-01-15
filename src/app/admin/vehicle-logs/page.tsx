"use client";

import { Group, Stack, Title } from "@mantine/core";
import Button from "@/app/_components/common/button/Button";
import VehicleLogTableView from "@/app/_components/vehiclelogcomponents/vehicle-log-table-view";
import Grid from "@/assets/icons/grid";
import Plus from "@/assets/icons/plus";

export default function VehicleLogsPage() {
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
          {/* TODO: implement add to log functionality */}
          <Button text="Add to Log" variant="primary" icon={<Plus />} onClick={() => {}} />
        </Group>
      </Group>

      {/* Table Section */}
      <VehicleLogTableView />
    </Stack>
  );
}
