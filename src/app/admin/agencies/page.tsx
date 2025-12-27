"use client";

import { Button, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { useState } from "react";
import Edit from "@/assets/icons/edit";
import Grid from "@/assets/icons/grid";
import Mail from "@/assets/icons/mail";
import styles from "./agencies.module.scss";

// Mock data
const mockAgencies = [
  {
    id: "1",
    name: "Amazing Agency",
    slug: "amazing-agency",
    dateJoined: "February 25th, 2025",
  },
  {
    id: "2",
    name: "Fireworks Org",
    slug: "fireworks-org",
    dateJoined: "March 10th, 2025",
  },
  {
    id: "3",
    name: "Star Agency",
    slug: "star-agency",
    dateJoined: "January 15th, 2025",
  },
  {
    id: "4",
    name: "Happy Agency",
    slug: "happy-agency",
    dateJoined: "April 5th, 2025",
  },
];

const mockMembers = [
  { id: "1", name: "Patrick Star", email: "patrick@gmail.com" },
  { id: "2", name: "Patrick Star", email: "patrick@gmail.com" },
  { id: "3", name: "Patrick Star", email: "patrick@gmail.com" },
  { id: "4", name: "Patrick Star", email: "patrick@gmail.com" },
  { id: "5", name: "Patrick Star", email: "patrick@gmail.com" },
  { id: "6", name: "Patrick Star", email: "patrick@gmail.com" },
  { id: "7", name: "Patrick Star", email: "patrick@gmail.com" },
  { id: "8", name: "Patrick Star", email: "patrick@gmail.com" },
  { id: "9", name: "Patrick Star", email: "patrick@gmail.com" },
];

export default function AgenciesPage() {
  const [selectedAgencyId, setSelectedAgencyId] = useState(mockAgencies[0]?.id ?? "1");

  const selectedAgency = mockAgencies.find((agency) => agency.id === selectedAgencyId);

  const handleExportToCSV = () => {
    // Mock export function - will be implemented later
    console.log("Exporting to CSV...");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title order={2}>View all Agencies</Title>
        <Button
          variant="outline"
          color="dark"
          leftSection={<Grid />}
          onClick={handleExportToCSV}
          className={styles.exportButton}
        >
          Export to CSV File
        </Button>
      </div>

      {/* Agency Tabs */}
      <Group gap="sm" mb="xl">
        {mockAgencies.map((agency) => (
          <Button
            key={agency.id}
            variant={selectedAgencyId === agency.id ? "filled" : "default"}
            color={selectedAgencyId === agency.id ? "dark" : "gray"}
            onClick={() => setSelectedAgencyId(agency.id)}
            className={styles.agencyTab}
          >
            {agency.name}
          </Button>
        ))}
      </Group>

      {/* Agency Information and User Information */}
      {selectedAgency && (
        <div className={styles.contentGrid}>
          {/* Agency Information */}
          <Paper className={styles.agencyInfoSection}>
            <Title order={3} mb="lg">
              Agency Information
            </Title>
            <Stack gap="md">
              <div>
                <Text fw={700} size="sm" c="dimmed" mb={4}>
                  Agency Name
                </Text>
                <Text size="md">{selectedAgency.name}</Text>
              </div>
              <div>
                <Text fw={700} size="sm" c="dimmed" mb={4}>
                  Agency Slug
                </Text>
                <Text size="md">{selectedAgency.slug}</Text>
              </div>
              <div>
                <Text fw={700} size="sm" c="dimmed" mb={4}>
                  Date Joined
                </Text>
                <Text size="md">{selectedAgency.dateJoined}</Text>
              </div>
            </Stack>
          </Paper>

          {/* User Information */}
          <Paper className={styles.userInfoSection}>
            <Title order={3} mb="lg">
              User Information
            </Title>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Group gap="xs">
                      <Edit />
                      <Text fw={700}>Member Name</Text>
                    </Group>
                  </Table.Th>
                  <Table.Th>
                    <Group gap="xs">
                      <Mail />
                      <Text fw={700}>Member Email Address</Text>
                    </Group>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mockMembers.map((member) => (
                  <Table.Tr key={member.id}>
                    <Table.Td>{member.name}</Table.Td>
                    <Table.Td>{member.email}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </div>
      )}
    </div>
  );
}
