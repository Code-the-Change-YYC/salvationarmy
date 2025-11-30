"use client";

import { Button, Divider, Group, Select, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { ALL_BOOKING_STATUSES, BookingStatus, type BookingStatusValue } from "@/types/types";
import styles from "./BookingDebugPage.module.scss";

export default function BookingDebugPage() {
  const [bookingId, setBookingId] = useState<number>(1);

  const form = useForm({
    initialValues: {
      title: "",
      pickupAddress: "",
      destinationAddress: "",
      passengerInfo: "",
      start: "",
      end: "",
      agencyId: "",
      purpose: "",
      driverId: "",
      status: BookingStatus.INCOMPLETE as BookingStatusValue,
    },
    validate: {
      title: (v) => (!v.trim() ? "Title is required" : null),
      pickupAddress: (v) => (!v.trim() ? "Pickup required" : null),
      destinationAddress: (v) => (!v.trim() ? "Dropoff required" : null),
      passengerInfo: (v) => (!v.trim() ? "Passenger info required" : null),
      agencyId: (v) => (!v.trim() ? "Agency ID required" : null),
      start: (v) => (!v.trim() ? "Start date/time required" : null),
      end: (v) => (!v.trim() ? "End date/time required" : null),
    },
  });

  const utils = api.useUtils();

  const bookingQuery = api.bookings.getById.useQuery({ id: bookingId }, { enabled: false });

  const allBookingsQuery = api.bookings.getAll.useQuery(undefined, {
    enabled: false,
    staleTime: 0,
  });

  const createMutation = api.bookings.create.useMutation({
    onSuccess: async () => {
      notifications.show({ color: "green", message: "Booking created!" });

      await utils.bookings.getAll.invalidate();
      await allBookingsQuery.refetch();

      form.reset();
    },
    onError: (err) => {
      notifications.show({ color: "red", message: err.message });
    },
  });

  const updateMutation = api.bookings.update.useMutation({
    onSuccess: async () => {
      notifications.show({ color: "blue", message: "Booking updated." });

      await Promise.all([
        utils.bookings.getById.invalidate({ id: bookingId }),
        utils.bookings.getAll.invalidate(),
      ]);

      bookingQuery.refetch();
      allBookingsQuery.refetch();
    },
    onError: (err) => notifications.show({ color: "red", message: err.message }),
  });

  const cancelMutation = api.bookings.cancel.useMutation({
    onSuccess: async () => {
      notifications.show({ color: "orange", message: "Booking canceled." });

      await utils.bookings.getAll.invalidate();
      bookingQuery.refetch();
      allBookingsQuery.refetch();
    },
    onError: (err) => notifications.show({ color: "red", message: err.message }),
  });

  const statusOptions = ALL_BOOKING_STATUSES.map((s) => ({
    value: s,
    label: s.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  return (
    <div className={styles.container}>
      <h1>Booking API Debug Panel</h1>

      <Group>
        <TextInput
          label="Booking ID"
          type="number"
          value={bookingId}
          onChange={(e) => setBookingId(Number(e.target.value))}
        />
        <Button loading={bookingQuery.isFetching} onClick={() => bookingQuery.refetch()}>
          Fetch Booking
        </Button>
      </Group>

      <Divider my="md" />

      {/* UPDATE STATUS */}
      <Select
        label="Update Status"
        value={form.values.status}
        onChange={(v) => form.setFieldValue("status", v as BookingStatusValue)}
        data={statusOptions}
      />

      <Button
        mt="sm"
        onClick={() => updateMutation.mutate({ id: bookingId, status: form.values.status })}
      >
        Update Status
      </Button>

      <Button color="red" mt="sm" onClick={() => cancelMutation.mutate({ id: bookingId })}>
        Cancel Booking
      </Button>

      <Divider my="xl" />

      {/* CREATE FORM */}
      <h2>Create Booking</h2>
      <form
        onSubmit={form.onSubmit((values) =>
          createMutation.mutate({
            title: values.title,
            pickupAddress: values.pickupAddress,
            destinationAddress: values.destinationAddress,
            passengerInfo: values.passengerInfo,
            agencyId: values.agencyId,
            startTime: values.start,
            endTime: values.end,
            purpose: values.purpose || undefined,
            driverId: values.driverId || null,
            status: values.status,
          }),
        )}
        className={styles.formGrid}
      >
        <TextInput withAsterisk label="Title" {...form.getInputProps("title")} />
        <TextInput withAsterisk label="Pickup Address" {...form.getInputProps("pickupAddress")} />
        <TextInput
          withAsterisk
          label="Destination Address"
          {...form.getInputProps("destinationAddress")}
        />
        <Textarea withAsterisk label="Passenger Info" {...form.getInputProps("passengerInfo")} />
        <TextInput withAsterisk label="Agency ID" {...form.getInputProps("agencyId")} />
        <TextInput label="Purpose (optional)" {...form.getInputProps("purpose")} />
        <TextInput label="Driver ID (optional)" {...form.getInputProps("driverId")} />
        <TextInput
          withAsterisk
          label="Starts"
          placeholder="2025-01-01T10:00:00Z"
          {...form.getInputProps("start")}
        />
        <TextInput
          withAsterisk
          label="Ends"
          placeholder="2025-01-01T12:00:00Z"
          {...form.getInputProps("end")}
        />

        <Button type="submit" className={styles.submitButton}>
          Create
        </Button>
      </form>

      {createMutation.isError && (
        <p className={styles.errorMessage}>{createMutation.error.message}</p>
      )}

      {createMutation.data && (
        <pre className={styles.jsonBlock}>{JSON.stringify(createMutation.data, null, 2)}</pre>
      )}

      {/* DATA VIEWS */}
      <section>
        <h3>Single Booking</h3>
        <pre className={styles.jsonBlock}>
          {bookingQuery.data ? JSON.stringify(bookingQuery.data, null, 2) : "No data"}
        </pre>
      </section>

      <section>
        <h3>All Bookings</h3>
        <Button loading={allBookingsQuery.isFetching} onClick={() => allBookingsQuery.refetch()}>
          Fetch All
        </Button>
        <pre className={styles.jsonBlock}>
          {allBookingsQuery.data ? JSON.stringify(allBookingsQuery.data, null, 2) : "No data"}
        </pre>
      </section>
    </div>
  );
}
