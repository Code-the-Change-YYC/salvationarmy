export type Role = "admin" | "driver" | "agency";

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

export interface ScheduleInformation {
  CREATED_AT: string; // string or date type?
  CLIENT_NAME: string;
  TELEPHONE: string;
  DATE_BOOKED: string; // Eventually this will be a date type
  TIME_BOOKED: string; // Eventually this will be a time type
  AGENCY: string; // I think eventually this will be an enumeration
  LOCATION: string;
}
