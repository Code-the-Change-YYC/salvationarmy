import { Box, Flex, Text, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import { forwardRef } from "react";

import { getStatusIcon, getStatusLabel } from "@/lib/utils";
import type { BookingStatus } from "@/types/types";

import styles from "./calendar-view.module.scss";

interface EventBlockProps {
  title: string;
  start: Date | null;
  end: Date | null;
  status: BookingStatus | null;
  showTime?: boolean;
}

const EventBlock = forwardRef<HTMLDivElement, EventBlockProps>(
  ({ title, start, end, status, showTime = true }, ref) => {
    const StatusIcon = getStatusIcon(status);

    return (
      <Box ref={ref} p="0.25rem">
        <Box className={styles.eventContentContainer}>
          <Box w="100%">
            <Text fw={600} size="sm" truncate="end">
              {title}
            </Text>
            {showTime && start && end && (
              <Text size="xs" opacity={0.75}>
                {dayjs(start).format("h:mm")} - {dayjs(end).format("h:mm")}
              </Text>
            )}
          </Box>

          <Box>
            {StatusIcon && (
              <Tooltip label={getStatusLabel(status)} withArrow>
                <Flex justify="center" align="center">
                  <StatusIcon size={16} />
                </Flex>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
);

EventBlock.displayName = "EventBlock";

export default EventBlock;
