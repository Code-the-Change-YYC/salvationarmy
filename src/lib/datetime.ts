import { TIME_SLOT_ROUNDING_MINUTES } from "@/constants/driver-assignment";

/**
 * Rounds a date up to the nearest time slot increment (default: 15 minutes)
 * Examples:
 * - 14:07 → 14:15
 * - 14:15 → 14:15
 * - 14:16 → 14:30
 * - 14:45 → 14:45
 * - 14:46 → 15:00
 *
 * @param date - The date to round up
 * @param incrementMinutes - The increment in minutes (default: 15)
 * @returns A new Date rounded up to the nearest increment
 */
export function roundUpToNearestIncrement(
  date: Date,
  incrementMinutes: number = TIME_SLOT_ROUNDING_MINUTES,
): Date {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const roundedMinutes = Math.ceil(minutes / incrementMinutes) * incrementMinutes;

  // If rounding goes past 60 minutes, add an hour and reset minutes
  if (roundedMinutes >= 60) {
    rounded.setHours(rounded.getHours() + 1);
    rounded.setMinutes(roundedMinutes - 60);
  } else {
    rounded.setMinutes(roundedMinutes);
  }

  // Reset seconds and milliseconds
  rounded.setSeconds(0);
  rounded.setMilliseconds(0);

  return rounded;
}
