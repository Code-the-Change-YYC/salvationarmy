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
        console.error(`Failed to send SMS to ${to.slice(0, -4).replace(/\d/g, "*") + to.slice(-4)}:`, err);
      }
    }),
  );
}

interface BookingSmsDetails {
  title: string;
  startTime: string;
  pickupAddress: string;
  destinationAddress: string;
}

export async function sendBookingCreatedSms(details: BookingSmsDetails, phoneNumbers: string[]) {
  await sendSmsToNumbers(
    `A new booking "${details.title}" has been created 🚗\n` +
      `Date: ${dayjs(details.startTime).format("MMM D, YYYY")} at ${dayjs(details.startTime).format("h:mm A")}\n` +
      `Pickup: ${details.pickupAddress}\n` +
      `Destination: ${details.destinationAddress}`,
    phoneNumbers,
  );
}

export async function sendBookingUpdatedSms(details: BookingSmsDetails, phoneNumbers: string[]) {
  await sendSmsToNumbers(
    `Booking "${details.title}" has been updated 🚗\n` +
      `Date: ${dayjs(details.startTime).format("MMM D, YYYY")} at ${dayjs(details.startTime).format("h:mm A")}\n` +
      `Pickup: ${details.pickupAddress}\n` +
      `Destination: ${details.destinationAddress}`,
    phoneNumbers,
  );
}