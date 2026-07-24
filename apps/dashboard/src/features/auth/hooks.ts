import { useAuth } from "./AuthProvider";
import type { UserRole } from "./types";

/** True when the current session has any of the given roles. */
export function useHasRole(...roles: UserRole[]): boolean {
  const { session } = useAuth();
  if (!session) return false;
  return roles.includes(session.user.role);
}

/** 
 * True if the user is an ADMIN or has the specific permission.
 * Expected permission format: "module:action" (e.g., "sales:view")
 */
export function useHasPermission(permission: string): boolean {
  const { session } = useAuth();
  if (!session) return false;
  
  // ADMIN role bypasses all permission checks
  if (session.user.role === "ADMIN") return true;
  
  return session.user.permissions?.includes(permission) ?? false;
}
