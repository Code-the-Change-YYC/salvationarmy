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
