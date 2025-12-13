import type { bookings } from "@/server/db/booking-schema";

export enum Role {
  ADMIN = "admin",
  DRIVER = "driver",
  AGENCY = "agency",
}

export enum OrganizationRole {
  MEMBER = "member",
  ADMIN = "admin",
  OWNER = "owner",
}

export const ADMIN_PROCEDURE_ROLES = [Role.ADMIN, Role.AGENCY];

export const ALL_ROLES: Role[] = [Role.ADMIN, Role.DRIVER, Role.AGENCY];

export const ALL_ORGANIZATION_ROLES: OrganizationRole[] = [
  OrganizationRole.MEMBER,
  OrganizationRole.ADMIN,
  OrganizationRole.OWNER,
];

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

export enum BookingStatus {
  INCOMPLETE = "incomplete",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export const ALL_BOOKING_STATUSES = [
  BookingStatus.INCOMPLETE,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
] as const;

export type BookingStatusValue = (typeof ALL_BOOKING_STATUSES)[number];

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  extendedProps?: {
    pickupAddress: string;
    destinationAddress: string;
    purpose?: string | null;
    passengerInfo: string;
    status: BookingStatus;
    agencyId: string;
    driverId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string | null;
    createdBy?: string;
    updatedBy?: string;
  };
}

export type Booking = typeof bookings.$inferSelect;
