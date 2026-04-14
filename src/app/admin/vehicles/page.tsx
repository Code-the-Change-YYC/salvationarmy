"use client";

import {
  Badge,
  Box,
  Center,
  Group,
  Loader,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import Button from "@/app/_components/common/button/Button";
import Modal from "@/app/_components/common/modal/modal";
import Plus from "@/assets/icons/plus";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";

type VehicleRow = {
  id: string;
  name: string;
  active: boolean;
};

export default function VehiclesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRow | null>(null);
  const utils = api.useUtils();

  const { data: vehiclesList, isLoading: isLoadingVehicles } = api.vehicles.getAllAdmin.useQuery();

  const createVehicle = api.vehicles.create.useMutation({
    onSuccess: () => {
      void utils.vehicles.getAll.invalidate();
      void utils.vehicles.getAllAdmin.invalidate();
      setShowAddModal(false);
      notify.success("Vehicle added successfully");
      addForm.reset();
    },
    onError: (error) => {
      notify.error(error.message ?? "Failed to add vehicle");
    },
  });

  const updateVehicle = api.vehicles.update.useMutation({
    onSuccess: () => {
      void utils.vehicles.getAll.invalidate();
      void utils.vehicles.getAllAdmin.invalidate();
      setShowEditModal(false);
      setSelectedVehicle(null);
      notify.success("Vehicle updated successfully");
      editForm.reset();
    },
    onError: (error) => {
      notify.error(error.message ?? "Failed to update vehicle");
    },
  });

  const addForm = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Vehicle name is required"),
    },
  });

  const editForm = useForm({
    initialValues: {
      name: "",
      active: "active",
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Vehicle name is required"),
      active: (value) => (value === "active" || value === "inactive" ? null : "Status is required"),
    },
  });

  const handleAddVehicle = () => {
    addForm.reset();
    setShowAddModal(true);
  };

  const handleEditVehicle = (vehicle: VehicleRow) => {
    setSelectedVehicle(vehicle);
    editForm.setValues({
      name: vehicle.name,
      active: vehicle.active ? "active" : "inactive",
    });
    setShowEditModal(true);
  };

  const handleAddConfirm = async () => {
    const validation = addForm.validate();
    if (validation.hasErrors) {
      return;
    }

    const values = addForm.values;
    await createVehicle.mutateAsync({
      name: values.name,
    });
  };

  const handleEditConfirm = async () => {
    if (!selectedVehicle) {
      return;
    }

    const validation = editForm.validate();
    if (validation.hasErrors) {
      return;
    }

    const values = editForm.values;
    await updateVehicle.mutateAsync({
      id: selectedVehicle.id,
      name: values.name,
      active: values.active === "active",
    });
  };

  return (
    <Stack gap="lg" p="md">
      <Title order={2}>View Vehicles</Title>
      <Text c="dimmed">These vehicles power the select menus in driver and admin forms.</Text>

      <Group justify="flex-end" align="center">
        <Button text="Add Vehicle" variant="primary" icon={<Plus />} onClick={handleAddVehicle} />
      </Group>

      {isLoadingVehicles ? (
        <Center p="xl">
          <Loader />
        </Center>
      ) : vehiclesList && vehiclesList.length > 0 ? (
        <ScrollArea>
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Vehicle Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {vehiclesList.map((vehicle) => (
                <Table.Tr key={vehicle.id}>
                  <Table.Td>{vehicle.name}</Table.Td>
                  <Table.Td>
                    <Badge color={vehicle.active ? "green" : "gray"}>
                      {vehicle.active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      text="Edit"
                      variant="secondary"
                      onClick={() => handleEditVehicle(vehicle)}
                    />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      ) : (
        <Text c="dimmed" ta="center" p="xl">
          No vehicles found. Add your first vehicle to get started.
        </Text>
      )}

      <Modal
        opened={showAddModal}
        onClose={() => {
          addForm.clearErrors();
          setShowAddModal(false);
        }}
        onConfirm={handleAddConfirm}
        title={
          <Box fw={600} fz="xl">
            Add New Vehicle
          </Box>
        }
        size="md"
        showDefaultFooter
        confirmText="Add Vehicle"
        loading={createVehicle.isPending || updateVehicle.isPending}
      >
        <Stack gap="md">
          <TextInput
            label="Vehicle Name"
            placeholder="e.g., Ford Expedition CTW 2776"
            {...addForm.getInputProps("name")}
          />
        </Stack>
      </Modal>

      <Modal
        opened={showEditModal}
        onClose={() => {
          editForm.clearErrors();
          setShowEditModal(false);
          setSelectedVehicle(null);
        }}
        onConfirm={handleEditConfirm}
        title={
          <Box fw={600} fz="xl">
            Edit Vehicle
          </Box>
        }
        size="md"
        showDefaultFooter
        confirmText="Save Changes"
        loading={createVehicle.isPending || updateVehicle.isPending}
      >
        <Stack gap="md">
          <TextInput
            label="Vehicle Name"
            placeholder="e.g., Ford Expedition CTW 2776"
            {...editForm.getInputProps("name")}
          />
          <Select
            label="Status"
            data={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            allowDeselect={false}
            {...editForm.getInputProps("active")}
          />
        </Stack>
      </Modal>
    </Stack>
  );
}
