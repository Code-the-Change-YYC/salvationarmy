import { Button, Group, Rating, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import Rating1 from "@/assets/icons/rating1";
import Rating2 from "@/assets/icons/rating2";
import Rating3 from "@/assets/icons/rating3";
import Rating4 from "@/assets/icons/rating4";
import Rating5 from "@/assets/icons/rating5";
import Modal from "../common/modal/modal";
import SegmentedControl from "../common/segmentedControl";
import styles from "./TripSurveyModal.module.scss";

export default function TripSurveyModal() {
  const [formOpen, setFormOpen] = useState(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      destinationAddress: "",
      timeOfDeparture: "",
      timeOfArrival: "",
      startReading: "",
      endReading: "",
      differentLocation: "No",
      passengerFitRating: "",
      comments: "",
    },
    validate: {
      destinationAddress: (value) =>
        value.length < 1 ? "Please enter a destination address" : null,
      timeOfDeparture: (value) => (value.length < 1 ? "Please enter a departure time" : null),
      timeOfArrival: (value) => (value.length < 1 ? "Please enter an arrival time" : null),
      startReading: (value) =>
        value.length < 1 || !Number.isInteger(Number(value))
          ? "Please enter a valid numerical reading"
          : null,
      endReading: (value) =>
        value.length < 1 || !Number.isInteger(Number(value))
          ? "Please enter a valid numerical reading"
          : null,
    },
  });

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
  const handleConfirm = async () => {
    const validation = form.validate();
    const hasErrors = Object.keys(validation.errors).length > 0;
    if (!hasErrors) {
      console.log(form.getValues());
    }
  };
  return (
    <>
      <Modal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        onConfirm={() => {
          handleConfirm();
        }}
        confirmText="Submit Form"
        size="md"
        closeOnClickOutside={false}
        withCloseButton={false}
        showDefaultFooter
      >
        <Text size="xl" fw={700}>
          Post Ride Survey
        </Text>
        <Text size="l" fw={700}>
          Drive Details
        </Text>
        <Stack gap="sm">
          <TextInput
            label="Destination Address"
            placeholder="123 Somestreet NW"
            {...form.getInputProps("destinationAddress")}
            required
          />
          <TextInput
            label="Time of Departure"
            placeholder="Enter departure time"
            {...form.getInputProps("timeOfDeparture")}
            required
          />
          <TextInput
            label="Time of Arrival"
            placeholder="Enter arrival time"
            {...form.getInputProps("timeOfArrival")}
            required
          />
          <TextInput
            label="Odometer start"
            placeholder="Enter odometer starting value"
            {...form.getInputProps("startReading")}
            required
          />
          <TextInput
            label="Odometer end"
            placeholder="Enter odometer ending value"
            {...form.getInputProps("endReading")}
            required
          />
          <Text size="l" fw={700}>
            Fit or Not fit
          </Text>
          <Text size="sm" fw={600}>
            Did the rider request to go to a different location than originally booked?
          </Text>
          <SegmentedControl
            size="sm"
            leftOption={{ value: "Yes", label: "Yes" }}
            rightOption={{ value: "No", label: "No" }}
            color="var(--color-cherry-red)"
            value={form.values.differentLocation}
            onChange={(e) => form.setFieldValue("differentLocation", e)}
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
              onChange={(e) => form.setFieldValue("passengerFitRating", String(e))}
              highlightSelectedOnly
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
      </Modal>
      <Button onClick={() => setFormOpen(true)} color="cyan">
        Open Trip Survey Form
      </Button>
    </>
  );
}
