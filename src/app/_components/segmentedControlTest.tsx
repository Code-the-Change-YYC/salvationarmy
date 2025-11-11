"use client";

import { Paper, Stack, Text } from "@mantine/core";
import type React from "react";
import { useState } from "react";
import Calendar from "../../assets/icons/calendar";
import Grid from "../../assets/icons/grid";
import { SegmentedControl } from "./segmentedControl";

export const SegmentedControlTest: React.FC = () => {
  const [viewMode, setViewMode] = useState("calendar");
  const [theme, setTheme] = useState("light");

  const leftViewOption = {
    value: "calendar",
    label: "Calendar View",
    icon: Calendar,
  };

  const rightViewOption = {
    value: "table",
    label: "Table View",
    icon: Grid,
  };

  const leftThemeOption = {
    value: "light",
    label: "Light",
  };

  const rightThemeOption = {
    value: "dark",
    label: "Dark",
  };

  return (
    <Stack gap="lg" p="md">
      <Paper p="md" withBorder>
        <Text size="lg" fw={500} mb="md">
          Segmented Control Test
        </Text>

        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb="xs">
              With Icons (Calendar/Table View)
            </Text>
            <SegmentedControl
              leftOption={leftViewOption}
              rightOption={rightViewOption}
              value={viewMode}
              onChange={setViewMode}
              color="black"
              size="md"
            />
            <Text size="xs" c="dimmed" mt="xs">
              Current view: {viewMode}
            </Text>
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Without Icons (Theme Selection)
            </Text>
            <SegmentedControl
              leftOption={leftThemeOption}
              rightOption={rightThemeOption}
              value={theme}
              onChange={setTheme}
              color="black"
              size="sm"
            />
            <Text size="xs" c="dimmed" mt="xs">
              Current theme: {theme}
            </Text>
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Different Sizes
            </Text>
            <Stack gap="xs">
              <div>
                <Text size="xs" mb="xs">
                  Small
                </Text>
                <SegmentedControl
                  leftOption={leftViewOption}
                  rightOption={rightViewOption}
                  value={viewMode}
                  onChange={setViewMode}
                  size="sm"
                />
              </div>
              <div>
                <Text size="xs" mb="xs">
                  Large
                </Text>
                <SegmentedControl
                  leftOption={leftViewOption}
                  rightOption={rightViewOption}
                  value={viewMode}
                  onChange={setViewMode}
                  size="lg"
                />
              </div>
            </Stack>
          </div>
          <div>
            <Text size="sm" fw={500} mb="xs">
              Different Colors
            </Text>
            <Stack gap="xs">
              <div>
                <Text size="xs" mb="xs">
                  Red
                </Text>
                <SegmentedControl
                  leftOption={leftThemeOption}
                  rightOption={rightThemeOption}
                  value={theme}
                  onChange={setTheme}
                  color="red"
                />
              </div>
            </Stack>
          </div>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default SegmentedControlTest;
