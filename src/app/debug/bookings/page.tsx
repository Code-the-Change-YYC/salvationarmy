"use client";

import { api } from "@/trpc/react";
import { useState } from "react";

export default function BookingDebugPage() {
  const [bookingId, setBookingId] = useState<number>(1);
  const [status, setStatus] = useState<"completed" | "incomplete" | "in-progress" | "canceled">(
    "completed",
  );

  const bookingQuery = api.bookings.getById.useQuery(
    { id: bookingId },
    { enabled: false }, // only fetch manually
  );

  const updateMutation = api.bookings.update.useMutation({
    onSuccess: () => bookingQuery.refetch(),
  });

  const cancelMutation = api.bookings.cancel.useMutation({
    onSuccess: () => bookingQuery.refetch(),
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🔧 Booking API Debug Panel</h1>

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
            setStatus(e.target.value as "completed" | "incomplete" | "in-progress" | "canceled")
          }
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="incomplete">Incomplete</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
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

      <h2>📦 API Response</h2>
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
    </div>
  );
}
