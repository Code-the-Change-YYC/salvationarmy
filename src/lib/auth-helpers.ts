import { type Session, auth } from "@/lib/auth";
import { ROLE_PERMISSIONS, type Role } from "@/types/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// session helpers for server components and API routes
export async function getSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

// this isn't the same as the one below.
// this will just redirect if no session is found, not based on role
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }
  return session;
}

// if the role isn't in the allowedRoles array, redirect to unauthorized
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  const userRole = session.user.role as Role;

  if (!allowedRoles.includes(userRole)) {
    redirect("/");
  }

  return session;
}

// check if the user has a specific permission based on their role
/*
example usage for later
    export async function GET() {
        const session = await requireRole(["admin"]);
        
        // Additional permission check
        if (!hasPermission(session.user.role as Role, "canManageUsers")) {
           return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        
        // Fetch users logic here
        return NextResponse.json({ users: [] });
}
*/
export function hasPermission(role: Role, permission: keyof typeof ROLE_PERMISSIONS.admin) {
  return ROLE_PERMISSIONS[role][permission];
}
