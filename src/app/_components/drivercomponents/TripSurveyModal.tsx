"use client";

import { Group, Radio, Rating, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import dayjs from "dayjs";
import Rating1 from "@/assets/icons/rating1";
import Rating2 from "@/assets/icons/rating2";
import Rating3 from "@/assets/icons/rating3";
import Rating4 from "@/assets/icons/rating4";
import Rating5 from "@/assets/icons/rating5";
import { BookingStatus } from "@/types/types";
import SegmentedControl from "../common/segmentedControl";
import styles from "./TripSurveyModal.module.scss";

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

export const TripSurveyModal = ({ form }: SurveyFormProps) => {
  const now = new Date();

  const getIconStyle = (color?: string) => ({
    width: 32,
    height: 32,
    color: color ? `var(--mantine-color-${color}-7)` : `var(--mantine-color-white)`,
  });

  const getEmptyIcon = (value: number) => {
    const iconStyle = getIconStyle();

    switch (value) {
      case 5:
        return <Rating5 style={iconStyle} />;
      case 4:
        return <Rating4 style={iconStyle} />;
      case 3:
        return <Rating3 style={iconStyle} />;
      case 2:
        return <Rating2 style={iconStyle} />;
      case 1:
        return <Rating1 style={iconStyle} />;
      default:
        return null;
    }
  };
  const getFullIcon = (value: number) => {
    switch (value) {
      case 5:
        return <Rating5 style={getIconStyle("green")} />;
      case 4:
        return <Rating4 style={getIconStyle("lime")} />;
      case 3:
        return <Rating3 style={getIconStyle("yellow")} />;
      case 2:
        return <Rating2 style={getIconStyle("orange")} />;
      case 1:
        return <Rating1 style={getIconStyle("red")} />;
      default:
        return null;
    }
  };
  return (
    <>
      <Text fw={700}>Drive Details</Text>
      <Stack gap="sm">
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
        <TextInput
          label="Destination Address"
          placeholder="123 Somestreet NW"
          {...form.getInputProps("destinationAddress")}
          required
        />
        <DateTimePicker
          label="Time of Departure"
          withAsterisk={true}
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

            if (isoString && form.values.timeOfArrival && form.values.timeOfArrival <= isoString) {
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
        <DateTimePicker
          withAsterisk={true}
          label="Time of Arrival"
          placeholder="Select arrival time"
          minDate={form.values.timeOfDeparture ? new Date(form.values.timeOfDeparture) : undefined}
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
        <TextInput
          label="Odometer start"
          placeholder="Enter odometer starting value"
          {...form.getInputProps("startReading")}
          required
          disabled={form.values.tripCompletionStatus === BookingStatus.CANCELLED}
        />
        <TextInput
          label="Odometer end"
          placeholder="Enter odometer ending value"
          {...form.getInputProps("endReading")}
          required
          disabled={form.values.tripCompletionStatus === BookingStatus.CANCELLED}
        />
        <Text fw={700}>Fit or Not fit</Text>
        <Text size="sm" fw={600}>
          Did the rider request to go to a different location than originally booked?
        </Text>
        <SegmentedControl
          size="sm"
          leftOption={{ value: "Yes", label: "Yes" }}
          rightOption={{ value: "No", label: "No" }}
          color="var(--color-cherry-red)"
          value={form.values.originalLocationChanged ? "Yes" : "No"}
          onChange={(e) =>
            form.setFieldValue("originalLocationChanged", e === "Yes" ? true : false)
          }
          disabled={form.values.tripCompletionStatus === BookingStatus.CANCELLED}
        ></SegmentedControl>
        Rate the passenger’s fitness for transport
        <div className={styles.rating}>
          <Rating
            styles={{
              root: {
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              },
            }}
            emptySymbol={getEmptyIcon}
            fullSymbol={getFullIcon}
            value={Number(form.values.passengerFitRating)}
            onChange={(e) => form.setFieldValue("passengerFitRating", e)}
            highlightSelectedOnly
            readOnly={form.values.tripCompletionStatus === BookingStatus.CANCELLED}
          ></Rating>
        </div>
        <Group justify="space-between" className={styles.ratingLabel}>
          <Text>Very Poor</Text>
          <Text>Excellent</Text>
        </Group>
        Additional Notes
        <Textarea
          autosize
          minRows={3}
          placeholder="Add any additional notes on passenger status during the ride (ex: politeness, sobriety)"
          {...form.getInputProps("comments")}
        ></Textarea>
      </Stack>
    </>
  );
};
