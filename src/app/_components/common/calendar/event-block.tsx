import { Box, Flex, Group, Text, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import { forwardRef } from "react";

import { getBookingStatusIcon, getBookingStatusLabel } from "@/lib/utils";
import type { BookingStatus } from "@/types/types";

interface EventBlockProps {
  title: string;
  start: Date | null;
  end: Date | null;
  status: BookingStatus | null;
  showTime?: boolean;
}

const EventBlock = forwardRef<HTMLDivElement, EventBlockProps>(
  ({ title, start, end, status, showTime = true }, ref) => {
    const StatusIcon = getBookingStatusIcon(status);

    return (
      <Group ref={ref} p="0.25rem" justify="between" align="start" w="100%">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} size="sm" truncate="end">
            {title}
          </Text>
          {showTime && start && end && (
            <Text size="xs" opacity={0.75}>
              {dayjs(start).format("h:mm")} - {dayjs(end).format("h:mm")}
            </Text>
          )}
        </Box>

        <Box style={{ flex: "0 0 auto" }}>
          {StatusIcon && (
            <Tooltip label={getBookingStatusLabel(status)} withArrow>
              <Flex justify="center" align="center">
                <StatusIcon size={16} />
              </Flex>
            </Tooltip>
          )}
        </Box>
      </Group>
    );
  },
);

EventBlock.displayName = "EventBlock";

export default EventBlock;
