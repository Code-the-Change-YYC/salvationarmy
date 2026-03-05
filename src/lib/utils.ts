import { CircleCheck, CircleX } from "lucide-react";

import { BookingStatus } from "@/types/types";

export function getBookingStatusIcon(status: BookingStatus | null) {
  switch (status) {
    case BookingStatus.COMPLETED:
      return CircleCheck;
    case BookingStatus.CANCELLED:
      return CircleX;
    default:
      return null;
  }
}

export function getBookingStatusColor(status: BookingStatus | null) {
  switch (status) {
    case BookingStatus.COMPLETED:
      return "#1A641E";
    case BookingStatus.CANCELLED:
      return "#A03145";
    default:
      return "gray";
  }
}

export function getBookingStatusLabel(status: BookingStatus | null) {
  if (!status) return "";
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
