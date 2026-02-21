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
import { DateInput, TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { ALL_BOOKING_STATUSES, BookingStatus, type BookingStatusValue } from "@/types/types";
import styles from "./BookingDebugPage.module.scss";

/** Returns true if end is after start (or invalid); used for form validation. */
function isEndAfterStart(start: string, end: string) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return true; // let backend/zod handle invalid formats
  return b > a;
}

/** Formats start and end as a time range string in UTC (e.g. 9:00 AM – 10:30 AM). */
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

/** Example pre-filled booking for testing. agencyId must be a valid user.id; set dynamically from getCurrentUser. */
const EXAMPLE_BOOKING = {
  title: "Test Example",
  pickupAddress: "The Inn from the Cold, 110 11 Ave SE, Calgary, AB",
  destinationAddress: "Sheldon M. Chumir Health Centre, 1213 4 St SW, Calgary, AB",
  passengerInfo: "John Smith",
  phoneNumber: "+1 (403) 760-9834",
  purpose: "Medical appointment",
  start: "2026-02-12T15:00:00.000Z", // Feb 12, 2026 3:00 PM UTC
};

/** Returns true if the booking overlaps the given UTC day (day boundaries in UTC). */
function bookingOverlapsDay(booking: { startTime: string; endTime: string }, day: Date): boolean {
  const y = day.getUTCFullYear();
  const m = day.getUTCMonth();
  const d = day.getUTCDate();
  const dStart = Date.UTC(y, m, d, 0, 0, 0, 0);
  const dEnd = Date.UTC(y, m, d, 23, 59, 59, 999);

  const start = new Date(booking.startTime).getTime();
  const end = new Date(booking.endTime).getTime();

  return start < dEnd && end > dStart;
}

type BookingForSchedule = {
  id: number;
  driverId: string | null;
  status: string;
  startTime: string;
  endTime: string;
  title: string;
};

/** Table of a driver's bookings for the selected day; shows time slot and title. */
function DriverScheduleTable({
  bookings,
  day,
  driverId,
}: {
  bookings: BookingForSchedule[];
  day: Date | null;
  driverId: string;
}) {
  if (!day || !driverId) return null;
  const bookedSlots = bookings
    .filter(
      (b) => b.driverId === driverId && b.status !== "cancelled" && bookingOverlapsDay(b, day),
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

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
}

/** Debug page for creating/editing bookings and viewing driver availability. */
export default function BookingDebugPage() {
  const [bookingId, setBookingId] = useState<number>(1);

  // Day picker for driver availability (date-only)
  const [selectedDay, setSelectedDay] = useState<Date | null>(() => {
    const d = new Date(EXAMPLE_BOOKING.start);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  });

  // Start time of day only (HH:mm) - day comes from selectedDay
  const [startTimeOfDay, setStartTimeOfDay] = useState<string>(() => {
    const d = new Date(EXAMPLE_BOOKING.start);
    const h = d.getUTCHours().toString().padStart(2, "0");
    const m = d.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  });
  const form = useForm({
    initialValues: {
      title: EXAMPLE_BOOKING.title,
      pickupAddress: EXAMPLE_BOOKING.pickupAddress,
      destinationAddress: EXAMPLE_BOOKING.destinationAddress,
      passengerInfo: EXAMPLE_BOOKING.passengerInfo,
      phoneNumber: EXAMPLE_BOOKING.phoneNumber ?? "",
      start: EXAMPLE_BOOKING.start, // will be kept in sync with picker (string)
      end: "", // will be kept in sync with picker (string), auto-calculated
      agencyId: "", // set from getCurrentUser (must be valid user.id for FK)
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
  const currentUserQuery = api.bookings.getCurrentUser.useQuery();

  // Set agencyId from current user so it references a valid user (fixes FK constraint)
  useEffect(() => {
    if (currentUserQuery.data && !form.values.agencyId) {
      form.setFieldValue("agencyId", currentUserQuery.data.id);
    }
  }, [currentUserQuery.data, form.setFieldValue, form.values.agencyId]);

  const driverOptions = useMemo(
    () =>
      (listDriversQuery.data ?? []).map((d) => ({
        value: d.id,
        label: "email" in d && d.email != null ? `${d.name} (${d.email})` : d.name,
      })),
    [listDriversQuery.data],
  );

  // Pre-select first driver when options load (for example pre-fill)
  useEffect(() => {
    if (driverOptions.length > 0 && !form.values.driverId) {
      form.setFieldValue("driverId", driverOptions[0]?.value ?? "");
    }
  }, [driverOptions, form.setFieldValue, form.values.driverId]);

  // Compute full start ISO from selectedDay + startTimeOfDay (naive UTC to match booking storage)
  const computedStart = useMemo(() => {
    const day = selectedDay;
    const time = startTimeOfDay;
    if (!day || !time) return "";
    const parts = time.split(":").map(Number);
    const [h, m] = parts;
    if (h == null || m == null || Number.isNaN(h) || Number.isNaN(m)) return "";
    const y = day.getFullYear();
    const mo = (day.getMonth() + 1).toString().padStart(2, "0");
    const d = day.getDate().toString().padStart(2, "0");
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    return `${y}-${mo}-${d}T${hh}:${mm}:00.000Z`;
  }, [selectedDay, startTimeOfDay]);

  // Keep form.start in sync with computedStart
  useEffect(() => {
    form.setFieldValue("start", computedStart);
  }, [computedStart, form.setFieldValue]);

  const canCalculateEnd =
    !!form.values.pickupAddress?.trim() &&
    !!form.values.destinationAddress?.trim() &&
    !!computedStart;

  const estimatedEndQuery = api.bookings.getEstimatedEndTime.useQuery(
    {
      pickupAddress: form.values.pickupAddress,
      destinationAddress: form.values.destinationAddress,
      startTime: computedStart,
    },
    { enabled: canCalculateEnd, staleTime: 5 * 60 * 1000 },
  );

  useEffect(() => {
    if (estimatedEndQuery.data) {
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
      pickupAddress: form.values.pickupAddress?.trim() || undefined,
      destinationAddress: form.values.destinationAddress?.trim() || undefined,
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
      const h = exampleStartDate.getUTCHours().toString().padStart(2, "0");
      const m = exampleStartDate.getUTCMinutes().toString().padStart(2, "0");
      setStartTimeOfDay(`${h}:${m}`);
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
            phoneNumber: values.phoneNumber?.trim() || null,
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
        <TextInput withAsterisk label="Passenger Info" {...form.getInputProps("passengerInfo")} />
        <TextInput
          label="Phone number (optional)"
          placeholder="+1 (403) 760-9834"
          maxLength={25}
          {...form.getInputProps("phoneNumber")}
        />
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
            const value = v as unknown;
            if (value instanceof Date) {
              setSelectedDay(new Date(value.getFullYear(), value.getMonth(), value.getDate()));
            } else {
              const str = (typeof value === "string" ? value : "").trim();
              if (!str) return;
              const parts = str.split("-").map(Number);
              const [y, m, day] = parts;
              if (y != null && m != null && day != null) {
                setSelectedDay(new Date(y, m - 1, day));
              }
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
              <DriverScheduleTable
                bookings={allBookingsQuery.data ?? []}
                day={selectedDay}
                driverId={form.values.driverId ?? ""}
              />
            )}
          </div>
        )}

        <TimeInput
          label="Start time"
          placeholder="Select time"
          value={startTimeOfDay}
          onChange={(v) => setStartTimeOfDay(v.target.value)}
        />

        {canCalculateEnd && estimatedEndQuery.data && (
          <div className={styles.debugOutput}>
            <h4>End time calculation</h4>
            <pre>
              {estimatedEndQuery.data.usedFallback &&
                "Using fallback travel time (API unavailable).\n"}
              {estimatedEndQuery.data.usedCached && "(From cache)\n"}
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

        <TextInput
          label="Ends"
          value={
            estimatedEndQuery.data?.estimatedEndTime
              ? new Date(estimatedEndQuery.data.estimatedEndTime).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "UTC",
                })
              : ""
          }
          placeholder={
            estimatedEndQuery.isLoading
              ? "Calculating…"
              : "Enter pickup, destination, and start time to calculate"
          }
          readOnly
          styles={{ input: { cursor: "default" } }}
        />

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
              : (availabilityQuery.data.reason ?? "Driver has another booking at this time.")}
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
