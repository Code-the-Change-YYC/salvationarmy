"use client";

import { Box, Card, Group, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import { useState } from "react";
import Button from "@/app/_components/common/button/Button";
import Modal from "@/app/_components/common/modal/modal";
import { notify } from "@/lib/notifications";
import { api } from "@/trpc/react";
import { BookingStatus, type Survey } from "@/types/types";
import { validateStringLength, validateTimeRange } from "@/types/validation";
import { TripSurveyModal } from "../TripSurveyModal";

type SurveyNotificationProps = {
  survey: Partial<Survey>;
  completed?: boolean;
};

export default function SurveyNotification({ survey, completed = false }: SurveyNotificationProps) {
  const [showSurveyModal, setShowSurveyModal] = useState<boolean>(false);

  const utils = api.useUtils();

  const mapSurveyToFormValues = (inputSurvey: Partial<Survey>) => ({
    tripCompletionStatus: inputSurvey.tripCompletionStatus || BookingStatus.COMPLETED,
    startReading: inputSurvey.startReading || ("" as number | ""),
    endReading: inputSurvey.endReading || ("" as number | ""),
    timeOfDeparture: inputSurvey.timeOfDeparture
      ? dayjs(inputSurvey.timeOfDeparture).toISOString()
      : "",
    timeOfArrival: inputSurvey.timeOfArrival ? dayjs(inputSurvey.timeOfArrival).toISOString() : "",
    destinationAddress: inputSurvey.destinationAddress || "",
    originalLocationChanged: inputSurvey.originalLocationChanged ?? false,
    passengerFitRating: inputSurvey.passengerFitRating || ("" as number | ""),
    comments: inputSurvey.comments || "",
  });

  const submitSurveyMutation = api.surveys.create.useMutation({
    onSuccess: () => {
      notify.success("Survey successfully submitted");
      form.reset();
      setShowSurveyModal(false);
      void utils.surveys.getAll.invalidate();
      void utils.bookings.getAll.invalidate({ surveyCompleted: false });
    },
    onError: (error) => {
      notify.error(error.message || "Failed to submit survey");
    },
  });

  const updateSurveyMutation = api.surveys.update.useMutation({
    onSuccess: (updatedSurvey) => {
      notify.success("Survey successfully updated");
      form.setValues(mapSurveyToFormValues(updatedSurvey));
      setShowSurveyModal(false);
      void utils.surveys.getAll.invalidate();
      void utils.surveys.getAll.setData(undefined, (current) => {
        if (!current) return current;
        return current.map((item) => (item.id === updatedSurvey.id ? updatedSurvey : item));
      });
    },
    onError: (error) => {
      notify.error(error.message || "Failed to update survey");
    },
  });

  // under the hood mantine numberInput is a string.
  const form = useForm({
    initialValues: mapSurveyToFormValues(survey),

    validate: {
      tripCompletionStatus: (value) => {
        if (!value) return "Trip completion status is required";
        return null;
      },
      startReading: (value, values) => {
        if (values.tripCompletionStatus === BookingStatus.CANCELLED) return null;
        if (value === "" || value === null) return "Start reading is required";
        if (typeof value === "number" && value <= 0) return "Start reading must be positive";
        return null;
      },
      endReading: (value, values) => {
        if (values.tripCompletionStatus === BookingStatus.CANCELLED) return null;
        if (value === "" || value === null) return "End reading is required";
        if (typeof value === "number" && value <= 0) return "End reading must be positive";
        if (
          typeof value === "number" &&
          typeof values.startReading === "number" &&
          value < values.startReading
        ) {
          return "End reading must be greater than start reading";
        }
        return null;
      },
      timeOfDeparture: (value, values) => {
        if (values.tripCompletionStatus === BookingStatus.CANCELLED) return null;
        if (value.trim().length === 0) return "Departure time is required";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Invalid date format";
        return null;
      },
      timeOfArrival: (value, values) => {
        if (values.tripCompletionStatus === BookingStatus.CANCELLED) return null;
        if (value.trim().length === 0) return "Arrival time is required";
        return validateTimeRange(values.timeOfDeparture, value);
      },
      destinationAddress: (value) => validateStringLength(value, 1, 300, "Destination address"),
      originalLocationChanged: (value, values) => {
        if (values.tripCompletionStatus === BookingStatus.CANCELLED) return null;
        if (typeof value !== "boolean") return "Please select an option";
        return null;
      },
      passengerFitRating: (value, values) => {
        if (values.tripCompletionStatus === BookingStatus.CANCELLED) return null;
        if (value === "" || value === null) return "Passenger fit rating is required";
        return null;
      },
      comments: (value) => {
        if (value.trim().length === 0) return null;
        return validateStringLength(value, 0, 1000, "Comments");
      },
    },
  });

  const handleConfirm = () => {
    const validation = form.validate();
    const hasErrors = Object.keys(validation.errors).length > 0;

    if (hasErrors) {
      notify.error("Please fix the errors in the form before submitting");
      return;
    }

    const isCancelled = form.values.tripCompletionStatus === BookingStatus.CANCELLED;

    // if the trip is cancelled don't need to pass any of the other fields.
    const basePayload = {
      tripCompletionStatus: form.values.tripCompletionStatus,
      destinationAddress: form.values.destinationAddress,
      passengerName: survey.passengerName || "",
      comments: form.values.comments,
      ...(!isCancelled && {
        startReading: Number(form.values.startReading),
        endReading: Number(form.values.endReading),
        timeOfDeparture: form.values.timeOfDeparture || undefined,
        timeOfArrival: form.values.timeOfArrival || undefined,
        originalLocationChanged: form.values.originalLocationChanged,
        passengerFitRating: Number(form.values.passengerFitRating),
      }),
    };

    if (completed) {
      if (!survey.id) {
        notify.error("Unable to update survey: missing survey id");
        return;
      }

      updateSurveyMutation.mutate({
        id: survey.id,
        ...basePayload,
      });
      return;
    }

    submitSurveyMutation.mutate({
      bookingId: survey.bookingId as number, // TODO: will remove eventually!
      driverId: survey.driverId as string, // TODO: will remove castin eveentually
      ...basePayload,
    });
  };

  const rideDate = survey.timeOfArrival
    ? dayjs(survey.timeOfArrival).format("MMM D, YYYY")
    : "Unknown date";

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text fw={600}>
              {completed ? "Survey completed" : "Fill out post ride survey"}{" "}
              {survey.passengerName && `for ${survey.passengerName}`}
            </Text>
            <Text size="sm" c="dimmed" mb="sm">
              {completed ? "Ride was completed on: " : "Fill out the survey for your ride on "}
              {rideDate}
            </Text>
            <Button
              width={150}
              onClick={() => {
                form.setValues(mapSurveyToFormValues(survey));
                setShowSurveyModal(true);
              }}
            >
              {completed ? "View survey results" : "Fill out survey"}
            </Button>
          </Stack>
          <Text size="sm" c="dimmed">
            {rideDate}
          </Text>
        </Group>
      </Card>

      <Modal
        opened={showSurveyModal}
        onClose={() => {
          form.clearErrors();
          setShowSurveyModal(false);
        }}
        onConfirm={handleConfirm}
        title={
          <Box fw={600} fz="xl">
            Post-Ride Survey
          </Box>
        }
        size="xl"
        showDefaultFooter
        confirmText={completed ? "Update Survey" : "Submit Survey"}
        loading={submitSurveyMutation.isPending || updateSurveyMutation.isPending}
      >
        <TripSurveyModal form={form} />
      </Modal>
    </>
  );
}
