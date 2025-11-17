"use client";

import { api } from "@/trpc/react";
import { useState } from "react";

export default function BookingDebugPage() {
  const [bookingId, setBookingId] = useState<number>(1);
  const [status, setStatus] = useState<"completed" | "incomplete" | "in-progress" | "cancelled">(
    "completed",
  );

  // Create form state
  const [createForm, setCreateForm] = useState({
    title: "",
    pickupLocation: "",
    dropoffLocation: "",
    purpose: "",
    passengerInfo: "",
    agencyId: "",
    driverId: "",
  });

  const utils = api.useUtils();

  // Single booking (manual fetch)
  const bookingQuery = api.bookings.getById.useQuery({ id: bookingId }, { enabled: false });

  // Create mutation
  const createMutation = api.bookings.create.useMutation({
    onSuccess: async () => {
      await utils.bookings.getAll.invalidate();
      allBookingsQuery.refetch();
      setCreateForm({
        title: "",
        pickupLocation: "",
        dropoffLocation: "",
        purpose: "",
        passengerInfo: "",
        agencyId: "",
        driverId: "",
      });
    },
  });

  // Mutations: on success, refresh both single + list
  const updateMutation = api.bookings.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.bookings.getById.invalidate({ id: bookingId }),
        utils.bookings.getAll.invalidate(),
      ]);
      bookingQuery.refetch();
      allBookingsQuery.refetch();
    },
  });

  const cancelMutation = api.bookings.cancel.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.bookings.getById.invalidate({ id: bookingId }),
        utils.bookings.getAll.invalidate(),
      ]);
      bookingQuery.refetch();
      allBookingsQuery.refetch();
    },
  });

  // All bookings (manual fetch)
  const allBookingsQuery = api.bookings.getAll.useQuery(undefined, {
    enabled: false,
    staleTime: 0,
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Booking API Debug Panel</h1>

      <label>
        <strong>Booking ID:</strong>
        <input
          type="number"
          value={bookingId}
          onChange={(e) => setBookingId(Number(e.target.value))}
          style={{ marginLeft: "1rem" }}
        />
      </label>

      <div style={{ marginTop: "1rem" }}>
        <button type="button" onClick={() => bookingQuery.refetch()}>
          Fetch Booking
        </button>
      </div>

      <hr style={{ margin: "1.5rem 0" }} />

      <h3>Update Status</h3>

      <label>
        New Status:
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "completed" | "incomplete" | "in-progress" | "cancelled")
          }
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="incomplete">Incomplete</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      <div style={{ marginTop: "1rem" }}>
        <button type="button" onClick={() => updateMutation.mutate({ id: bookingId, status })}>
          Update Booking
        </button>
      </div>

      <hr style={{ margin: "1.5rem 0" }} />

      <button
        type="button"
        style={{ backgroundColor: "#b30000", color: "white", padding: "0.5rem" }}
        onClick={() => cancelMutation.mutate({ id: bookingId })}
      >
        Cancel Booking
      </button>

      <hr style={{ margin: "1.5rem 0" }} />

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {/* Single booking panel */}
        <section>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Single Booking</h2>
            {bookingQuery.isFetching && <small>loading…</small>}
            {bookingQuery.error && (
              <small style={{ color: "tomato" }}>error: {bookingQuery.error.message}</small>
            )}
          </div>
          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: "1rem",
              borderRadius: "8px",
              overflowX: "auto",
            }}
          >
            {bookingQuery.data ? JSON.stringify(bookingQuery.data, null, 2) : "No data yet"}
          </pre>
        </section>

        {/* All bookings panel */}
        <section>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>All Bookings</h2>
            <button type="button" onClick={() => allBookingsQuery.refetch()}>
              Fetch All Bookings
            </button>
            {allBookingsQuery.isFetching && <small>loading…</small>}
            {allBookingsQuery.error && (
              <small style={{ color: "tomato" }}>error: {allBookingsQuery.error.message}</small>
            )}
          </div>
          <pre
            style={{
              background: "#111",
              color: "#0ff",
              padding: "1rem",
              borderRadius: "8px",
              overflowX: "auto",
              marginTop: "0.75rem",
            }}
          >
            {allBookingsQuery.data ? JSON.stringify(allBookingsQuery.data, null, 2) : "No data yet"}
          </pre>
        </section>

        {/* Create booking panel */}
        <section>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Create Booking</h2>
            {createMutation.error && (
              <small style={{ color: "tomato" }}>error: {createMutation.error.message}</small>
            )}
          </div>
          <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
            <input
              type="text"
              placeholder="Title"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              style={{ padding: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Pickup Location"
              value={createForm.pickupLocation}
              onChange={(e) => setCreateForm({ ...createForm, pickupLocation: e.target.value })}
              style={{ padding: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Dropoff Location"
              value={createForm.dropoffLocation}
              onChange={(e) => setCreateForm({ ...createForm, dropoffLocation: e.target.value })}
              style={{ padding: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Purpose (optional)"
              value={createForm.purpose}
              onChange={(e) => setCreateForm({ ...createForm, purpose: e.target.value })}
              style={{ padding: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Passenger Info"
              value={createForm.passengerInfo}
              onChange={(e) => setCreateForm({ ...createForm, passengerInfo: e.target.value })}
              style={{ padding: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Agency ID"
              value={createForm.agencyId}
              onChange={(e) => setCreateForm({ ...createForm, agencyId: e.target.value })}
              style={{ padding: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Driver ID (optional)"
              value={createForm.driverId}
              onChange={(e) => setCreateForm({ ...createForm, driverId: e.target.value })}
              style={{ padding: "0.5rem" }}
            />
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "completed" | "incomplete" | "in-progress" | "cancelled",
                )
              }
              style={{ padding: "0.5rem" }}
            >
              <option value="">Select Booking Status</option>
              <option value="incomplete">Incomplete</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              type="button"
              onClick={() =>
                createMutation.mutate({
                  ...createForm,
                  driverId: createForm.driverId || null,
                  purpose: createForm.purpose || undefined,
                })
              }
              style={{ padding: "0.5rem", backgroundColor: "#0066cc", color: "white" }}
            >
              Create Booking
            </button>
          </div>
          {createMutation.data && (
            <pre
              style={{
                background: "#111",
                color: "#ff0",
                padding: "1rem",
                borderRadius: "8px",
                overflowX: "auto",
                marginTop: "0.75rem",
              }}
            >
              {JSON.stringify(createMutation.data, null, 2)}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}
