"use client";

import { Group, Stack, Title } from "@mantine/core";
import Button from "@/app/_components/common/button/Button";
import RiderLogTableView from "@/app/_components/riderlogcomponents/rider-log-table-view";
import Grid from "@/assets/icons/grid";

export default function RiderLogsPage() {
  return (
    <Stack gap="lg" p="md">
      <Title order={2}>Rider Logs</Title>
      <Group justify="flex-end" align="center">
        {/* TODO: SANC-96 adds csv functionality */}
        <Button text="Export to CSV File" variant="secondary" icon={<Grid />} />
      </Group>
      <RiderLogTableView />
    </Stack>
  );
}
