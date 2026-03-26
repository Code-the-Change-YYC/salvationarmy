import dayjs from "dayjs";
import Telnyx from "telnyx";
import { env } from "@/env";

const globalForTelnyx = globalThis as unknown as {
  telnyx: Telnyx | undefined;
};

const apiKey = env.TELNYX_API_KEY ?? "placeholder";

const conn = globalForTelnyx.telnyx ?? new Telnyx({ apiKey });
if (env.NODE_ENV !== "production") globalForTelnyx.telnyx = conn;

async function sendSmsToNumbers(message: string, toNumbers: string[]) {
  if (!env.TELNYX_API_KEY) return;

  const numbers = toNumbers.filter((n): n is string => Boolean(n?.trim()));
  if (numbers.length === 0) return;

  await Promise.all(
    numbers.map(async (to) => {
      try {
        await conn.messages.send({
          from: env.TELNYX_NUMBER,
          to,
          text: message,
        });
      } catch (err) {
        const redactedTo = `${"*".repeat(Math.max(0, to.length - 4))}${to.slice(-4)}`;
        console.error(`Failed to send SMS to ${redactedTo}:`, err);
      }
    }),
  );
}

interface BookingSmsDetails {
  bookingId: number;
  purpose: string;
  startTime: string;
  endTime: string;
  pickupAddress: string;
  destinationAddress: string;
}

const BOOKING_SMS_DATE_FORMAT = "MMM D, YYYY";
const BOOKING_SMS_TIME_FORMAT = "h:mm A";

function formatBookingSmsDate(iso: string) {
  return dayjs(iso).format(BOOKING_SMS_DATE_FORMAT);
}

function formatBookingSmsTime(iso: string) {
  return dayjs(iso).format(BOOKING_SMS_TIME_FORMAT);
}

/** Snapshot fields used for booking-update SMS diffs (matches booking row shape). */
export interface BookingSmsUpdateSnapshot {
  startTime: string;
  endTime: string;
  pickupAddress: string;
  destinationAddress: string;
}

export async function sendBookingCreatedSms(details: BookingSmsDetails, phoneNumbers: string[]) {
  const message = `Booking #${details.bookingId} has been created 🚗

Purpose: ${details.purpose}
Date: ${formatBookingSmsDate(details.startTime)}
Time: ${formatBookingSmsTime(details.startTime)} - ${formatBookingSmsTime(details.endTime)}
Pickup: ${details.pickupAddress}
Destination: ${details.destinationAddress}`;

  await sendSmsToNumbers(message, phoneNumbers);
}

export async function sendBookingUpdatedSms(
  bookingId: number,
  before: BookingSmsUpdateSnapshot,
  after: BookingSmsUpdateSnapshot,
  phoneNumbers: string[],
) {
  const lines: string[] = [];

  const startChanged = new Date(before.startTime).getTime() !== new Date(after.startTime).getTime();
  const endChanged = new Date(before.endTime).getTime() !== new Date(after.endTime).getTime();

  if (startChanged || endChanged) {
    const dateChanged =
      formatBookingSmsDate(before.startTime) !== formatBookingSmsDate(after.startTime) ||
      formatBookingSmsDate(before.endTime) !== formatBookingSmsDate(after.endTime);

    if (dateChanged) {
      lines.push(
        `Date: ${formatBookingSmsDate(before.startTime)} → ${formatBookingSmsDate(after.startTime)}`,
      );
    }

    lines.push(
      `Time: ${formatBookingSmsTime(before.startTime)} - ${formatBookingSmsTime(before.endTime)} → ${formatBookingSmsTime(after.startTime)} - ${formatBookingSmsTime(after.endTime)}`,
    );
  }
  if (before.pickupAddress.trim() !== after.pickupAddress.trim()) {
    lines.push(`Pickup address: ${before.pickupAddress.trim()} → ${after.pickupAddress.trim()}`);
  }
  if (before.destinationAddress.trim() !== after.destinationAddress.trim()) {
    lines.push(
      `Destination address: ${before.destinationAddress.trim()} → ${after.destinationAddress.trim()}`,
    );
  }

  if (lines.length === 0) return;

  const message = `Updates have been made on booking #${bookingId}:\n\n${lines.join("\n")}`;

  await sendSmsToNumbers(message, phoneNumbers);
}
