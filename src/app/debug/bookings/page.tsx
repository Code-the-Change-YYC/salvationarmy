"use client";

import {
  Alert,
  Button,
  Divider,
  Group,
  Select,
  Table,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "@/app/_components/common/datepicker/DatePicker";
import { api } from "@/trpc/react";
import { ALL_BOOKING_STATUSES, BookingStatus, type BookingStatusValue } from "@/types/types";
import styles from "./BookingDebugPage.module.scss";

function isEndAfterStart(start: string, end: string) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return true; // let backend/zod handle invalid formats
  return b > a;
}

function formatTimeSlot(startTime: string, endTime: string): string {
  // Format in UTC to match stored booking times (e.g. "09:00:00+00" -> "9:00 AM")
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  };
  const start = new Date(startTime).toLocaleTimeString("en-US", opts);
  const end = new Date(endTime).toLocaleTimeString("en-US", opts);
  return `${start} – ${end}`;
}

/** Example pre-filled booking for testing */
const EXAMPLE_BOOKING = {
  title: "Test Example",
  pickupAddress: "The Inn from the Cold, 110 11 Ave SE, Calgary, AB",
  destinationAddress: "Sheldon M. Chumir Health Centre, 1213 4 St SW, Calgary, AB",
  passengerInfo: "1 passenger",
  agencyId: "AGENCY_001",
  purpose: "Medical appointment",
  start: "2026-02-15T15:00:00.000Z", // Feb 20, 2026 3:00 PM UTC
};

function bookingOverlapsDay(booking: { startTime: string; endTime: string }, day: Date): boolean {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const start = new Date(booking.startTime).getTime();
  const end = new Date(booking.endTime).getTime();
  const dStart = dayStart.getTime();
  const dEnd = dayEnd.getTime();

  return start < dEnd && end > dStart;
}

export default function BookingDebugPage() {
  const [bookingId, setBookingId] = useState<number>(1);

  // Day picker for driver availability (date-only)
  const [selectedDay, setSelectedDay] = useState<Date | null>(() => {
    const d = new Date(EXAMPLE_BOOKING.start);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  });

  // Keep DatePicker values exactly like the styleguide: string | null
  const [startPickerValue, setStartPickerValue] = useState<string | null>(EXAMPLE_BOOKING.start);
  const [endPickerValue, setEndPickerValue] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      title: EXAMPLE_BOOKING.title,
      pickupAddress: EXAMPLE_BOOKING.pickupAddress,
      destinationAddress: EXAMPLE_BOOKING.destinationAddress,
      passengerInfo: EXAMPLE_BOOKING.passengerInfo,
      start: EXAMPLE_BOOKING.start, // will be kept in sync with picker (string)
      end: "", // will be kept in sync with picker (string), auto-calculated
      agencyId: EXAMPLE_BOOKING.agencyId,
      purpose: EXAMPLE_BOOKING.purpose,
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

  const canShowDriverAvailability = !!selectedDay && !!form.values.driverId?.trim();

  const allBookingsQuery = api.bookings.getAll.useQuery(undefined, {
    enabled: true, // fetch on load for both driver availability table and Fetch All
    staleTime: 0,
  });

  const listDriversQuery = api.bookings.listDrivers.useQuery();
  const driverOptions = useMemo(
    () =>
      (listDriversQuery.data ?? []).map((d) => ({
        value: d.id,
        label: `${d.name} (${d.email})`,
      })),
    [listDriversQuery.data],
  );

  // Pre-select first driver when options load (for example pre-fill)
  useEffect(() => {
    if (driverOptions.length > 0 && !form.values.driverId) {
      form.setFieldValue("driverId", driverOptions[0]?.value ?? "");
    }
  }, [driverOptions, form.setFieldValue, form.values.driverId]);

  const canCalculateEnd =
    !!form.values.pickupAddress?.trim() &&
    !!form.values.destinationAddress?.trim() &&
    !!form.values.start;

  const estimatedEndQuery = api.bookings.getEstimatedEndTime.useQuery(
    {
      pickupAddress: form.values.pickupAddress,
      destinationAddress: form.values.destinationAddress,
      startTime: form.values.start,
    },
    { enabled: canCalculateEnd },
  );

  useEffect(() => {
    if (estimatedEndQuery.data) {
      setEndPickerValue(estimatedEndQuery.data.estimatedEndTime);
      form.setFieldValue("end", estimatedEndQuery.data.estimatedEndTime);
    }
  }, [estimatedEndQuery.data, form.setFieldValue]);

  const canCheckAvailability =
    !!form.values.driverId?.trim() &&
    !!form.values.start &&
    !!form.values.end &&
    isEndAfterStart(form.values.start, form.values.end);

  const availabilityQuery = api.bookings.isDriverAvailable.useQuery(
    {
      driverId: form.values.driverId,
      startTime: form.values.start,
      endTime: form.values.end,
    },
    { enabled: canCheckAvailability },
  );

  const createMutation = api.bookings.create.useMutation({
    onSuccess: async () => {
      notifications.show({ color: "green", message: "Booking created!" });

      await utils.bookings.getAll.invalidate();
      await allBookingsQuery.refetch();

      form.reset();
      const exampleStartDate = new Date(EXAMPLE_BOOKING.start);
      setSelectedDay(
        new Date(
          exampleStartDate.getUTCFullYear(),
          exampleStartDate.getUTCMonth(),
          exampleStartDate.getUTCDate(),
        ),
      );
      setStartPickerValue(EXAMPLE_BOOKING.start);
      setEndPickerValue(null);
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

  const endAfterStart = useMemo(() => {
    if (!form.values.start || !form.values.end) return true;
    return isEndAfterStart(form.values.start, form.values.end);
  }, [form.values.start, form.values.end]);

  return (
    <div className={styles.container}>
      <h1>Booking API Debug Panel</h1>

      {/* CREATE FORM */}
      <h2>Create Booking</h2>
      <form
        onSubmit={form.onSubmit((values) => {
          // Front-end guard matching backend refine()
          if (!isEndAfterStart(values.start, values.end)) {
            notifications.show({
              color: "red",
              message: "End time must be after start time.",
            });
            return;
          }

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
          });
        })}
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

        <DateInput
          label="Day"
          placeholder="Pick a day"
          value={selectedDay}
          onChange={(v) => {
            if (v == null) {
              setSelectedDay(null);
              return;
            }
            // Parse as local date to avoid UTC-off-by-one (e.g. "2025-02-15" -> Feb 14 in PST)
            const str = typeof v === "string" ? v : (v as Date).toISOString().slice(0, 10);
            const parts = str.split("-").map(Number);
            const [y, m, day] = parts;
            if (y != null && m != null && day != null) {
              setSelectedDay(new Date(y, m - 1, day));
            }
          }}
          valueFormat="MMM D, YYYY"
          clearable
        />

        <Select
          label="Driver (optional)"
          placeholder="Select driver"
          data={driverOptions}
          searchable
          clearable
          {...form.getInputProps("driverId")}
        />

        {canShowDriverAvailability && (
          <div className={styles.bookedSlotsTable}>
            <h4>
              Driver bookings for{" "}
              {selectedDay?.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </h4>
            {allBookingsQuery.isLoading ? (
              <Text size="sm" c="dimmed">
                Loading…
              </Text>
            ) : (
              (() => {
                const day = selectedDay;
                const driverId = form.values.driverId;
                if (!day || !driverId) return null;
                const bookedSlots = (allBookingsQuery.data ?? [])
                  .filter(
                    (b) =>
                      b.driverId === driverId &&
                      b.status !== "cancelled" &&
                      bookingOverlapsDay(b, day),
                  )
                  .sort(
                    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
                  );

                if (bookedSlots.length === 0) {
                  return (
                    <Text size="sm" c="dimmed">
                      No bookings this day – driver available all day
                    </Text>
                  );
                }

                return (
                  <Table withTableBorder withColumnBorders className={styles.bookedSlotsTableBody}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Time slot</Table.Th>
                        <Table.Th>Booking</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {bookedSlots.map((b) => (
                        <Table.Tr key={b.id}>
                          <Table.Td>{formatTimeSlot(b.startTime, b.endTime)}</Table.Td>
                          <Table.Td>
                            Booking #{b.id} – {b.title}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                );
              })()
            )}
          </div>
        )}

        {/* ✅ Styleguide DatePicker (date + time) */}
        <DatePicker
          label="Starts"
          placeholder="Select date and time"
          value={startPickerValue}
          onChange={(v) => {
            setStartPickerValue(v);
            form.setFieldValue("start", v ?? "");
          }}
        />

        <TextInput
          label="Ends"
          value={
            endPickerValue
              ? new Date(endPickerValue).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : ""
          }
          placeholder="Enter pickup, destination, and start time to calculate"
          readOnly
          styles={{ input: { cursor: "default" } }}
        />

        {canCalculateEnd && estimatedEndQuery.data && (
          <div className={styles.debugOutput}>
            <h4>End time calculation</h4>
            <pre>
              {/* Location 1: {estimatedEndQuery.data.location1}
              {"\n"}
              Location 2: {estimatedEndQuery.data.location2}
              {"\n"} */}
              Calculated driving time: {estimatedEndQuery.data.drivingTimeMinutes} min
              {"\n"}
              Total booking time: {estimatedEndQuery.data.totalBookingMinutes} min (15 min pickup
              wait + {estimatedEndQuery.data.drivingTimeMinutes} min travel)
              {"\n"}
              Start time: {estimatedEndQuery.data.startTime}
              {"\n"}
              Estimated end time: {estimatedEndQuery.data.estimatedEndTime}
            </pre>
          </div>
        )}

        {!endAfterStart && (
          <p className={styles.errorMessage}>End time must be after start time.</p>
        )}

        {canCheckAvailability && availabilityQuery.isLoading && (
          <Text size="sm" c="dimmed">
            Checking availability…
          </Text>
        )}
        {canCheckAvailability && availabilityQuery.data && (
          <Alert
            color={availabilityQuery.data.available ? "green" : "red"}
            title={availabilityQuery.data.available ? "Driver available" : "Driver not available"}
          >
            {availabilityQuery.data.available
              ? "Driver is available for this time."
              : "Driver has another booking at this time."}
          </Alert>
        )}
        {!canCheckAvailability && form.values.driverId?.trim() && (
          <Text size="sm" c="dimmed">
            Enter start and end time to check driver availability.
          </Text>
        )}

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

      <Divider my="xl" />

      {/* SINGLE BOOKING */}
      <section>
        <h3>Single Booking</h3>
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
        <Select
          label="Update Status"
          value={form.values.status}
          onChange={(v) => form.setFieldValue("status", v as BookingStatusValue)}
          data={statusOptions}
          mt="sm"
        />
        <Group mt="sm">
          <Button
            onClick={() => updateMutation.mutate({ id: bookingId, status: form.values.status })}
          >
            Update Status
          </Button>
          <Button color="red" onClick={() => cancelMutation.mutate({ id: bookingId })}>
            Cancel Booking
          </Button>
        </Group>
        <pre className={styles.jsonBlock}>
          {bookingQuery.data ? JSON.stringify(bookingQuery.data, null, 2) : "No data"}
        </pre>
      </section>

      {/* ALL BOOKINGS */}
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
