import { Box, Divider, Flex, Group, Stack, Text, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import { Calendar, ClipboardList, Clock, MapPin, Pencil, Trash2, User } from "lucide-react";

import Button from "@/app/_components/common/button/Button";
import { getBookingStatusColor, getBookingStatusIcon, getBookingStatusLabel } from "@/lib/utils";
import { type CalendarEvent, CalendarUserView } from "@/types/types";

interface EventDetailsProps {
  event: CalendarEvent;
  viewType?: CalendarUserView;
}

export default function EventDetails({ event, viewType }: EventDetailsProps) {
  const { title, start, end, extendedProps } = event;
  const status = extendedProps?.status ?? null;
  const pickupAddress = extendedProps?.pickupAddress;
  const destinationAddress = extendedProps?.destinationAddress;
  const passengerInfo = extendedProps?.passengerInfo;
  const purpose = extendedProps?.purpose;
  const StatusIcon = getBookingStatusIcon(status);
  const statusColor = getBookingStatusColor(status);

  return (
    <Stack gap="sm" justify="space-between" h="100%">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600} size="lg" truncate="end" style={{ flex: 1 }}>
            {title}
          </Text>
          {StatusIcon && (
            <Tooltip label={getBookingStatusLabel(status)} withArrow>
              <Flex justify="center" align="center" c={statusColor}>
                <StatusIcon size={20} />
              </Flex>
            </Tooltip>
          )}
        </Group>

        <Divider />

        <Stack gap="0.25rem">
          <Group gap="0.35rem" wrap="nowrap" c="dimmed">
            <Calendar size={14} />
            <Text size="xs">Date</Text>
          </Group>
          <Text size="sm">{dayjs(start).format("dddd, MMM D")}</Text>
        </Stack>

        <Stack gap="0.25rem">
          <Group gap="0.35rem" wrap="nowrap" c="dimmed">
            <Clock size={14} />
            <Text size="xs">Time</Text>
          </Group>
          <Text size="sm">
            {dayjs(start).format("h:mm A")} - {dayjs(end).format("h:mm A")}
          </Text>
        </Stack>

        {pickupAddress && (
          <Stack gap="0.25rem">
            <Group gap="0.35rem" wrap="nowrap" c="dimmed">
              <MapPin size={14} />
              <Text size="xs">Pickup</Text>
            </Group>
            <Text size="sm">{pickupAddress}</Text>
          </Stack>
        )}

        {destinationAddress && (
          <Stack gap="0.25rem">
            <Group gap="0.35rem" wrap="nowrap" c="dimmed">
              <MapPin size={14} />
              <Text size="xs">Dropoff</Text>
            </Group>
            <Text size="sm">{destinationAddress}</Text>
          </Stack>
        )}

        {passengerInfo && (
          <Stack gap="0.25rem">
            <Group gap="0.35rem" wrap="nowrap" c="dimmed">
              <User size={14} />
              <Text size="xs">Passenger</Text>
            </Group>
            <Text size="sm">{passengerInfo}</Text>
          </Stack>
        )}

        {purpose && (
          <>
            <Divider />
            <Stack gap="0.25rem">
              <Text size="xs" c="dimmed">
                Purpose
              </Text>
              <Text size="sm">{purpose}</Text>
            </Stack>
          </>
        )}
      </Stack>

      {viewType === CalendarUserView.ADMIN && (
        <Group gap="sm" mt="md">
          <Button variant="secondary" icon={<Pencil size={14} />} onClick={() => {}}>
            Edit
          </Button>
          <Button variant="primary" color="#E03131" icon={<Trash2 size={14} />} onClick={() => {}}>
            Delete
          </Button>
        </Group>
      )}

      {viewType === CalendarUserView.DRIVER && (
        <Box mt="md">
          <Button
            variant="primary"
            icon={<ClipboardList size={14} />}
            width="100%"
            onClick={() => {}}
          >
            Fill Out Ride Survey
          </Button>
        </Box>
      )}
    </Stack>
  );
}
