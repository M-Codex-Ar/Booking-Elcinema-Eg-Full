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

  const userRole = user.user_metadata?.["role"] as string | undefined;
  if (userRole === "admin") return "admin";

  if (user.email?.toLowerCase() === "admin@elcinema.com") return "admin";

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
