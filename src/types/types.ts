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
  COMPLETED = "completed",
  IN_PROGRESS = "in-progress",
}

export interface Booking {
  id: string;
  title: string;
  pickupAddress: string;
  destinationAddress: string;
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
    pickupAddress: string;
    destinationAddress: string;
    purpose?: string;
    passengerInfo: string;
    status: BookingStatus;
    agencyId: string;
    driverId?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy?: string;
    updatedBy?: string;
  };
}
