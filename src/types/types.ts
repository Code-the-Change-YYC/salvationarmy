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
