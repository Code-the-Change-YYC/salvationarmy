"use client";

import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import Modal from "@/app/_components/common/modal/modal";

export const ModalTests = () => {
  const [simpleOpen, setSimpleOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const [largeOpen, setLargeOpen] = useState(false);

  const [customFooterOpen, setCustomFooterOpen] = useState(false);

  const [noCloseOpen, setNoCloseOpen] = useState(false);

  const [loadingOpen, setLoadingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [xlOpen, setXlOpen] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: "en",
  });

  const handleLoadingConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingOpen(false);
      alert("Action completed!");
    }, 2000);
  };

  return (
    <Stack p="xl" gap="md">
      <Text size="xl" fw={700}>
        Reusable Modal Test Cases
      </Text>

      <Button onClick={() => setSimpleOpen(true)}>1. Simple Modal (No Footer)</Button>
      <Modal
        opened={simpleOpen}
        onClose={() => setSimpleOpen(false)}
        onConfirm={() => {}}
        title="Simple Modal"
      >
        <Text>This is a simple modal with just content and no footer buttons.</Text>
      </Modal>

      <Button onClick={() => setConfirmOpen(true)} color="red">
        2. Confirmation Modal (Default Footer)
      </Button>
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          alert("Confirmed!");
          setConfirmOpen(false);
        }}
        title="Delete Item"
        showDefaultFooter
        confirmText="Delete"
        cancelText="Cancel"
      >
        <Text>Are you sure you want to delete this item? This action cannot be undone.</Text>
      </Modal>

      <Button onClick={() => setFormOpen(true)} color="blue">
        3. Form Modal with Inputs
      </Button>
      <Modal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        onConfirm={() => {
          console.log("Form data:", formData);
          alert(`Saved: ${formData.name} - ${formData.email}`);
          setFormOpen(false);
        }}
        title="User Information"
        showDefaultFooter
        confirmText="Save"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextInput
            label="Email"
            placeholder="john@example.com"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Textarea label="Bio" placeholder="Tell us about yourself" minRows={3} />
        </Stack>
      </Modal>

      <Button onClick={() => setLargeOpen(true)} color="teal">
        4. Large Size Modal
      </Button>
      <Modal
        opened={largeOpen}
        onClose={() => setLargeOpen(false)}
        onConfirm={() => setLargeOpen(false)}
        title="Terms and Conditions"
        size="lg"
        showDefaultFooter
        confirmText="I Accept"
      >
        <Stack gap="md">
          <Text size="sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Text>
          <Text size="sm">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </Text>
          <Alert color="blue" title="Important">
            Please read these terms carefully before proceeding.
          </Alert>
        </Stack>
      </Modal>

      <Button onClick={() => setCustomFooterOpen(true)} color="grape">
        5. Custom Footer Modal
      </Button>
      <Modal
        opened={customFooterOpen}
        onClose={() => setCustomFooterOpen(false)}
        onConfirm={() => {}}
        title="Choose an Option"
        footer={
          <Group justify="space-between" mt="md">
            <Button variant="outline" onClick={() => alert("Option 1")}>
              Option 1
            </Button>
            <Button variant="outline" onClick={() => alert("Option 2")}>
              Option 2
            </Button>
            <Button onClick={() => setCustomFooterOpen(false)}>Done</Button>
          </Group>
        }
      >
        <Text>This modal has a completely custom footer with multiple action buttons.</Text>
      </Modal>

      <Button onClick={() => setNoCloseOpen(true)} color="orange">
        6. No Close Button (Must Use Footer)
      </Button>
      <Modal
        opened={noCloseOpen}
        onClose={() => setNoCloseOpen(false)}
        onConfirm={() => setNoCloseOpen(false)}
        title="Important Message"
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        showDefaultFooter
        confirmText="OK, Got It"
      >
        <Stack gap="md">
          <Badge color="red" size="lg">
            Requires Action
          </Badge>
          <Text>
            You must acknowledge this message by clicking the button below. The X button and
            clicking outside are disabled.
          </Text>
        </Stack>
      </Modal>

      <Button onClick={() => setLoadingOpen(true)} color="indigo">
        7. Loading State Modal
      </Button>
      <Modal
        opened={loadingOpen}
        onClose={() => setLoadingOpen(false)}
        onConfirm={handleLoadingConfirm}
        title="Process Action"
        showDefaultFooter
        loading={isLoading}
        confirmText="Process"
      >
        <Text>Click Process to simulate a loading state (2 seconds).</Text>
      </Modal>

      <Button onClick={() => setXlOpen(true)} color="pink">
        8. Extra Large Modal (xl)
      </Button>
      <Modal
        opened={xlOpen}
        onClose={() => setXlOpen(false)}
        onConfirm={() => setXlOpen(false)}
        title="Dashboard Overview"
        size="xl"
        showDefaultFooter
      >
        <Stack gap="lg">
          <Group grow>
            <div
              style={{
                padding: "2rem",
                background: "#f0f0f0",
                borderRadius: "8px",
              }}
            >
              <Text fw={700}>Metric 1</Text>
              <Text size="xl">1,234</Text>
            </div>
            <div
              style={{
                padding: "2rem",
                background: "#f0f0f0",
                borderRadius: "8px",
              }}
            >
              <Text fw={700}>Metric 2</Text>
              <Text size="xl">5,678</Text>
            </div>
            <div
              style={{
                padding: "2rem",
                background: "#f0f0f0",
                borderRadius: "8px",
              }}
            >
              <Text fw={700}>Metric 3</Text>
              <Text size="xl">9,012</Text>
            </div>
          </Group>
          <Text>This extra large modal is perfect for dashboards and complex layouts.</Text>
        </Stack>
      </Modal>

      <Button onClick={() => setSettingsOpen(true)} color="cyan">
        9. Settings Modal (Complex Form)
      </Button>
      <Modal
        opened={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onConfirm={() => {
          console.log("Settings saved:", settings);
          alert("Settings saved!");
          setSettingsOpen(false);
        }}
        title="Application Settings"
        size="md"
        showDefaultFooter
        confirmText="Save Settings"
      >
        <Stack gap="md">
          <Checkbox
            label="Enable notifications"
            checked={settings.notifications}
            onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
          />
          <Checkbox
            label="Dark mode"
            checked={settings.darkMode}
            onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
          />
          <Select
            label="Language"
            data={[
              { value: "en", label: "English" },
              { value: "es", label: "Spanish" },
              { value: "fr", label: "French" },
            ]}
            value={settings.language}
            onChange={(value) => setSettings({ ...settings, language: value || "en" })}
          />
          <NumberInput label="Session timeout (minutes)" defaultValue={30} min={5} max={120} />
        </Stack>
      </Modal>
    </Stack>
  );
};

export default ModalTests;
