export type Role = "admin" | "driver" | "agency";

export const ADMIN_PROCEDURE_ROLES = ["admin", "agency"];

export const ROLE_PERMISSIONS = {
  admin: {
    canAccessAdmin: true,
    canAccessDriver: true,
    canAccessAgency: true,
    canManageUsers: true,
  },
  driver: {
    canAccessAdmin: false,
    canAccessDriver: true,
    canAccessAgency: false,
    canManageUsers: false,
  },
  agency: {
    canAccessAdmin: false,
    canAccessDriver: false,
    canAccessAgency: true,
    canManageUsers: false,
  },
} as const;

export enum ViewMode {
  CALENDAR = "calendar",
  TABLE = "table",
}

export type { ViewMode as IViewMode };

export type BookingStatus = "incomplete" | "completed" | "in-progress";

export interface Booking {
  id: string;
  title: string;
  pickupLocation: string;
  dropoffLocation: string;
  purpose?: string;
  passengerInfo: string;
  status: BookingStatus;
  agencyId: string;
  driverId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// The booking schema does not include start and end times, so we need to add them here
export interface CalendarBooking extends Booking {
  start: string;
  end?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  extendedProps?: {
    pickupLocation: string;
    dropoffLocation: string;
    purpose?: string;
    passengerInfo: string;
    status: "incomplete" | "completed" | "in-progress";
    agencyId: string;
    driverId?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy?: string;
    updatedBy?: string;
  };
}
