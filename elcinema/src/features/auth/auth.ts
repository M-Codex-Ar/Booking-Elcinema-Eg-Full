import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "user";

/**
 * Extract user role from Supabase user object.
 * Priority:
 * 1. app_metadata.role (cryptographically signed in JWT by Supabase Auth)
 * 2. user_metadata.role
 * 3. Fallback: admin email check (e.g. admin@elcinema.com)
 */
export function getUserRole(user: User | null | undefined): UserRole {
  if (!user) return "user";

  const appRole = user.app_metadata?.["role"] as string | undefined;
  if (appRole === "admin") return "admin";

  // user_metadata is user-editable, so this is UI gating only; real
  // authorization happens server-side via requireAdminRole on JWT claims.
  const userRole = user.user_metadata?.["role"] as string | undefined;
  if (userRole === "admin") return "admin";

  return "user";
}

/** Check if the user has admin role. */
export function isAdmin(user: User | null | undefined): boolean {
  return getUserRole(user) === "admin";
}

/** Get readable user display name or email. */
export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return "";
  const name =
    (user.user_metadata?.["full_name"] as string | undefined) ||
    (user.user_metadata?.["name"] as string | undefined);
  if (name?.trim()) return name.trim();
  if (user.email) return user.email.split("@")[0] || user.email;
  return "";
}

/**
 * Extract role from JWT claims object (used in server functions).
 * Priority same as getUserRole but works with claims object instead of User.
 */
export function getRoleFromClaims(claims: Record<string, unknown> | undefined): string | null {
  if (!claims) return null;

  // Note: a top-level claims["role"] in a Supabase JWT is the Postgres role
  // ("authenticated"/"anon"), never the app role, so it must not be trusted here.
  const role =
    ((claims["app_metadata"] as Record<string, unknown>)?.["role"] as string | undefined) ||
    ((claims["user_metadata"] as Record<string, unknown>)?.["role"] as string | undefined);

  return role || null;
}

/**
 * Require admin role from JWT claims, throw if not admin.
 * Used in protected server functions (saveManagedRow, deleteManagedRow, etc).
 */
export function requireAdminRole(claims: Record<string, unknown> | undefined): void {
  const role = getRoleFromClaims(claims);
  if (role !== "admin") {
    throw new Error("Forbidden: Admin privileges required");
  }
}
