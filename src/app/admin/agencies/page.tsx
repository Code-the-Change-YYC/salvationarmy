"use client";

import { Button, Group, Loader, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import Edit from "@/assets/icons/edit";
import Grid from "@/assets/icons/grid";
import Mail from "@/assets/icons/mail";
import { api } from "@/trpc/react";
import styles from "./agencies.module.scss";

export default function AgenciesPage() {
  const { data: organizations, isLoading } = api.organization.getAllWithMembers.useQuery();

  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);

  // Set the first agency as selected when data loads
  const selectedAgency =
    organizations?.find((org) => org.id === selectedAgencyId) ?? organizations?.[0];

  // Update selected ID when organizations load
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedAgencyId) {
      setSelectedAgencyId(organizations[0]?.id ?? null);
    }
  }, [organizations, selectedAgencyId]);

  // Format date helper
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Loader size="lg" />
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className={styles.container}>
        <Title order={2}>View all Agencies</Title>
        <Text c="dimmed" mt="lg">
          No agencies found. Create an organization to get started.
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title order={2}>View all Agencies</Title>
        <Button
          variant="outline"
          color="dark"
          leftSection={<Grid />}
          className={styles.exportButton}
        >
          Export to CSV File
        </Button>
      </div>

      {/* Agency Tabs */}
      <Group gap="sm" mb="xl">
        {organizations?.map((org) => (
          <Button
            key={org.id}
            variant={selectedAgencyId === org.id ? "filled" : "default"}
            color={selectedAgencyId === org.id ? "dark" : "gray"}
            onClick={() => setSelectedAgencyId(org.id)}
            className={styles.agencyTab}
          >
            {org.name}
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
                <Text size="md">{selectedAgency?.name}</Text>
              </div>
              <div>
                <Text fw={700} size="sm" c="dimmed" mb={4}>
                  Agency Slug
                </Text>
                <Text size="md">{selectedAgency?.slug}</Text>
              </div>
              <div>
                <Text fw={700} size="sm" c="dimmed" mb={4}>
                  Date Joined
                </Text>
                <Text size="md">
                  {selectedAgency?.createdAt ? formatDate(selectedAgency.createdAt) : "N/A"}
                </Text>
              </div>
            </Stack>
          </Paper>

          {/* User Information */}
          <Paper className={styles.userInfoSection}>
            <Title order={3} mb="lg">
              User Information
            </Title>
            <Table striped highlightOnHover withColumnBorders>
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
                {selectedAgency?.members && selectedAgency.members.length > 0 ? (
                  selectedAgency.members.map((member) => (
                    <Table.Tr key={member.id}>
                      <Table.Td>{member.user.name || "No name"}</Table.Td>
                      <Table.Td>{member.user.email}</Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={2}>
                      <Text c="dimmed" ta="center">
                        No members found
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </div>
      )}
    </div>
  );
}
