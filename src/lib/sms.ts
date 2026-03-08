import dayjs from "dayjs";
import Telnyx from "telnyx";
import { env } from "@/env";

const globalForTelnyx = globalThis as unknown as {
  telnyx: Telnyx | undefined;
};

const apiKey = env.TELNYX_API_KEY ?? "placeholder";

const conn = globalForTelnyx.telnyx ?? new Telnyx({ apiKey });
if (env.NODE_ENV !== "production") globalForTelnyx.telnyx = conn;

async function sendSms(message: string) {
  if (!env.TELNYX_API_KEY) return;

  try {
    await conn.messages.send({
      from: env.TELNYX_NUMBER,
      to: process.env.TEST_RECIPIENT_PHONE_NUMBER!, // TODO: Update this before production
      text: message,
    });
  } catch (err) {
    console.error("Failed to send SMS:", err);
  }
}

interface BookingSmsDetails {
  title: string;
  startTime: string;
  pickupAddress: string;
  destinationAddress: string;
}

export async function sendBookingCreatedSms(details: BookingSmsDetails) {
  await sendSms(
    `A new booking "${details.title}" has been created 🚗\n` +
      `Date: ${dayjs(details.startTime).format("MMM D, YYYY")} at ${dayjs(details.startTime).format("h:mm A")}\n` +
      `Pickup: ${details.pickupAddress}\n` +
      `Destination: ${details.destinationAddress}`,
  );
}

export async function sendBookingUpdatedSms(details: BookingSmsDetails) {
  await sendSms(
    `Booking "${details.title}" has been updated 🚗\n` +
      `Date: ${dayjs(details.startTime).format("MMM D, YYYY")} at ${dayjs(details.startTime).format("h:mm A")}\n` +
      `Pickup: ${details.pickupAddress}\n` +
      `Destination: ${details.destinationAddress}`,
  );
}
