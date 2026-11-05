import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "editor" | "viewer" | "user";

/**
 * Map a raw Supabase auth error message to bilingual i18n copy.
 *
 * Provider messages are English-only, so anything we do not recognise is
 * replaced with the generic failure copy instead of leaking raw provider
 * text into the Arabic edition. Recognised failures map to a dedicated key:
 *
 * - "invalid login credentials" → wrong email/password (the common 400 on
 *   `grant_type=password`)
 * - "email not confirmed"       → account exists but the confirmation link
 *   was never used
 * - "already registered"/"already in use" → duplicate sign-up
 * - "too many requests"/"rate limit" → API throttling
 */
export function describeAuthError<T extends string>(
  t: (key: T) => string,
  message: string,
): string {
  const msg = message.toLowerCase();
  if (msg.includes("invalid login credentials")) return t("auth.invalidCredentials" as T);
  if (msg.includes("email not confirmed")) return t("auth.emailNotConfirmed" as T);
  if (msg.includes("already registered") || msg.includes("already in use")) {
    return t("auth.alreadyRegistered" as T);
  }
  if (msg.includes("too many requests") || msg.includes("rate limit")) {
    return t("auth.tooManyAttempts" as T);
  }
  // Unknown failure: log the raw text for debugging, show generic copy.
  console.error("auth: unhandled provider error:", message);
  return t("auth.requestFailed" as T);
}

/**
 * Extract user role from Supabase user object.
 * Priority:
 * 1. app_metadata.role (cryptographically signed in JWT by Supabase Auth)
 * app_metadata is written only by trusted Supabase Auth admin operations.
 * user_metadata and email addresses are user-controlled and never authorize access.
 */
export function getUserRole(user: User | null | undefined): UserRole {
  if (!user) return "user";

  const appRole = user.app_metadata?.["role"] as string | undefined;
  return appRole === "admin" || appRole === "editor" || appRole === "viewer" ? appRole : "user";
}

/** Check if the user has admin role. */
export function isAdmin(user: User | null | undefined): boolean {
  return getUserRole(user) === "admin";
}

/** Staff can open the dashboard; viewers receive read-only access there. */
export function canAccessDashboard(user: User | null | undefined): boolean {
  return getUserRole(user) !== "user";
}

/** Editors may add/update managed content; admins may also delete it. */
export function canEditManagedContent(user: User | null | undefined): boolean {
  const role = getUserRole(user);
  return role === "admin" || role === "editor";
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
 * Reads only trusted app_metadata; user_metadata is user-editable.
 */
export function getRoleFromClaims(claims: Record<string, unknown> | undefined): string | null {
  if (!claims) return null;

  // Note: a top-level claims["role"] in a Supabase JWT is the Postgres role
  // ("authenticated"/"anon"), never the app role, so it must not be trusted here.
  const role = (claims["app_metadata"] as Record<string, unknown>)?.["role"];
  return role === "admin" || role === "editor" || role === "viewer" ? role : "user";
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

/** Require a trusted admin/editor claim for managed-content create/update. */
export function requireContentEditorRole(claims: Record<string, unknown> | undefined): void {
  const role = getRoleFromClaims(claims);
  if (role !== "admin" && role !== "editor") {
    throw new Error("Forbidden: Content editor privileges required");
  }
}
