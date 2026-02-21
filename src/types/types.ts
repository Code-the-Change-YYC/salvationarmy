import type { BookingSelectType } from "@/server/db/booking-schema";
import type { SurveySelectType } from "@/server/db/post-trip-schema";

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

export enum CalendarUserView {
  ADMIN = "admin",
  DRIVER = "driver",
  AGENCY = "agency",
}

export type { ViewMode as IViewMode };

export enum BookingStatus {
  INCOMPLETE = "incomplete",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export const BOOKING_STATUSES = [
  BookingStatus.INCOMPLETE,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
] as const;

export type BookingStatusValue = (typeof BOOKING_STATUSES)[number];

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  color?: string;
  extendedProps?: {
    pickupAddress: string;
    destinationAddress: string;
    purpose?: string | null;
    passengerInfo: string | null;
    status: BookingStatus;
    agencyId: string;
    driverId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string | null;
    createdBy?: string;
    updatedBy?: string;
    originalBooking?: Booking;
  };
}

// the reason that we do this is because it being named selectType causes confusion
export type Booking = BookingSelectType;
export type Survey = SurveySelectType;

export interface ScheduleInformation {
  CREATED_AT: string; // string or date type?
  CLIENT_NAME: string | null;
  TELEPHONE: string;
  DATE_BOOKED: string; // Eventually this will be a date type
  TIME_BOOKED: string; // Eventually this will be a time type
  AGENCY: string; // I think eventually this will be an enumeration
  LOCATION: string;
}
