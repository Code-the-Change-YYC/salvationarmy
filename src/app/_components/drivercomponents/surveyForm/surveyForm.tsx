"use client";

import { Box, Divider, NumberInput, Radio, Stack, Textarea, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import dayjs from "dayjs";
import { BookingStatus } from "@/types/types";
import styles from "./survey-form.module.scss";

interface SurveyForm {
  tripCompletionStatus: BookingStatus;
  startReading: number | "";
  endReading: number | "";
  timeOfDeparture: string;
  timeOfArrival: string;
  destinationAddress: string;
  originalLocationChanged: boolean;
  passengerFitRating: number | "";
  comments: string;
}

interface SurveyFormProps {
  form: UseFormReturnType<SurveyForm>;
}

export const SurveyForm = ({ form }: SurveyFormProps) => {
  const now = new Date();

  return (
    <Stack gap="lg">
      <Stack gap="md">
        <Box fw={500} fz="lg">
          Trip Details
        </Box>

        <div className={`${styles.formRow}`}>
          <Radio.Group
            withAsterisk
            label="Trip Completion Status"
            key={form.key("tripCompletionStatus")}
            {...form.getInputProps("tripCompletionStatus")}
            error={form.errors.tripCompletionStatus}
          >
            <div className={styles.radioGrid}>
              <Radio value={BookingStatus.COMPLETED} label="Completed" />
              <Radio value={BookingStatus.INCOMPLETE} label="Incomplete" />
              <Radio value={BookingStatus.CANCELLED} label="Cancelled" />
            </div>
          </Radio.Group>
        </div>

        <div className={styles.formRow}>
          <NumberInput
            withAsterisk
            label="Start Odometer Reading"
            placeholder="Enter start reading"
            min={0}
            hideControls
            key={form.key("startReading")}
            {...form.getInputProps("startReading")}
            error={form.errors.startReading}
          />
        </div>

        <div className={styles.formRow}>
          <NumberInput
            withAsterisk={form.values.tripCompletionStatus !== BookingStatus.CANCELLED}
            label="End Odometer Reading"
            placeholder="Enter end reading"
            min={0}
            hideControls
            disabled={form.values.tripCompletionStatus === BookingStatus.CANCELLED}
            key={form.key("endReading")}
            {...form.getInputProps("endReading")}
            error={form.errors.endReading}
          />
        </div>
      </Stack>

      <Divider />

      <Stack gap="md">
        <Box fw={500} fz="lg">
          Time Information
        </Box>

        <div className={styles.formRow}>
          <DateTimePicker
            withAsterisk={form.values.tripCompletionStatus !== BookingStatus.CANCELLED}
            label="Time of Departure"
            placeholder="Select departure time"
            maxDate={now}
            valueFormat="MMM DD, YYYY hh:mm A"
            value={form.values.timeOfDeparture ? new Date(form.values.timeOfDeparture) : null}
            onChange={(value) => {
              if (!value) {
                form.setFieldValue("timeOfDeparture", "");
                return;
              }
              const isoString = dayjs(value).toISOString();
              form.setFieldValue("timeOfDeparture", isoString);

              if (
                isoString &&
                form.values.timeOfArrival &&
                form.values.timeOfArrival <= isoString
              ) {
                form.setFieldValue("timeOfArrival", "");
              }
            }}
            disabled={form.values.tripCompletionStatus === BookingStatus.CANCELLED}
            timePickerProps={{
              withDropdown: true,
              popoverProps: { withinPortal: false },
              format: "12h",
            }}
            clearable
            error={form.errors.timeOfDeparture}
          />
        </div>

        <div className={styles.formRow}>
          <DateTimePicker
            withAsterisk={form.values.tripCompletionStatus !== BookingStatus.CANCELLED}
            label="Time of Arrival"
            placeholder="Select arrival time"
            minDate={
              form.values.timeOfDeparture ? new Date(form.values.timeOfDeparture) : undefined
            }
            maxDate={now}
            valueFormat="MMM DD, YYYY hh:mm A"
            value={form.values.timeOfArrival ? new Date(form.values.timeOfArrival) : null}
            onChange={(value) => {
              if (!value) {
                form.setFieldValue("timeOfArrival", "");
                return;
              }
              const isoString = dayjs(value).toISOString();
              form.setFieldValue("timeOfArrival", isoString);
            }}
            disabled={
              form.values.tripCompletionStatus === BookingStatus.CANCELLED ||
              !form.values.timeOfDeparture
            }
            timePickerProps={{
              withDropdown: true,
              popoverProps: { withinPortal: false },
              format: "12h",
            }}
            clearable
            error={form.errors.timeOfArrival}
          />
        </div>
      </Stack>

      <Divider />

      <Stack gap="md">
        <Box fw={500} fz="lg">
          Location & Passenger Information
        </Box>

        <div className={styles.formRow}>
          <TextInput
            withAsterisk
            label="Destination Address"
            placeholder="Enter destination address"
            key={form.key("destinationAddress")}
            {...form.getInputProps("destinationAddress")}
            error={form.errors.destinationAddress}
          />
        </div>

        <div className={styles.formRow}>
          <Radio.Group
            withAsterisk={form.values.tripCompletionStatus !== BookingStatus.CANCELLED}
            label="Was the original location changed?"
            key={form.key("originalLocationChanged")}
            value={form.values.originalLocationChanged ? "true" : "false"}
            onChange={(value) => form.setFieldValue("originalLocationChanged", value === "true")}
            disabled={form.values.tripCompletionStatus === BookingStatus.CANCELLED}
            error={form.errors.originalLocationChanged}
          >
            <Stack mt="xs">
              <Radio value="true" label="Yes" />
              <Radio value="false" label="No" />
            </Stack>
          </Radio.Group>
        </div>

        <div className={styles.formRow}>
          <NumberInput
            withAsterisk={form.values.tripCompletionStatus !== BookingStatus.CANCELLED}
            label="Passenger Fit Rating"
            description="Rate from 1 (poor) to 5 (excellent)"
            placeholder="Enter rating (1-5)"
            min={1}
            max={5}
            disabled={form.values.tripCompletionStatus === BookingStatus.CANCELLED}
            key={form.key("passengerFitRating")}
            {...form.getInputProps("passengerFitRating")}
            error={form.errors.passengerFitRating}
          />
        </div>

        <div className={styles.formRow}>
          <Textarea
            label="Comments"
            placeholder="Enter any additional comments about the trip"
            key={form.key("comments")}
            {...form.getInputProps("comments")}
            minRows={3}
          />
        </div>
      </Stack>
    </Stack>
  );
};
