import { describe, expect, it } from "vitest";
import {
  canAccessDashboard,
  canEditManagedContent,
  describeAuthError,
  getRoleFromClaims,
  getUserDisplayName,
  getUserRole,
  isAdmin,
  requireAdminRole,
  requireContentEditorRole,
} from "@/features/auth/auth";
import type { User } from "@supabase/supabase-js";

function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: "test-user-id",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    ...overrides,
  } as User;
}

describe("Supabase Auth Roles & Helpers", () => {
  it("detects admin from app_metadata", () => {
    const adminUser = mockUser({
      app_metadata: { role: "admin" },
      email: "staff@example.com",
    });
    expect(getUserRole(adminUser)).toBe("admin");
    expect(isAdmin(adminUser)).toBe(true);
  });

  it("does not trust user-editable metadata for authorization", () => {
    const adminUser = mockUser({
      user_metadata: { role: "admin" },
      email: "staff@example.com",
    });
    expect(getUserRole(adminUser)).toBe("user");
    expect(isAdmin(adminUser)).toBe(false);
    expect(canAccessDashboard(adminUser)).toBe(false);
  });

  it("does not grant admin from email alone (role must come from metadata)", () => {
    const user = mockUser({
      email: "admin@elcinema.com",
    });
    expect(getUserRole(user)).toBe("user");
    expect(isAdmin(user)).toBe(false);
  });

  it("defaults to user role for normal users", () => {
    const regularUser = mockUser({
      email: "regular@example.com",
      user_metadata: { role: "user" },
      app_metadata: { role: "user" },
    });
    expect(getUserRole(regularUser)).toBe("user");
    expect(isAdmin(regularUser)).toBe(false);
  });

  it("grants role capabilities only from trusted app_metadata", () => {
    const editor = mockUser({ app_metadata: { role: "editor" } });
    const viewer = mockUser({ app_metadata: { role: "viewer" } });
    expect(canAccessDashboard(editor)).toBe(true);
    expect(canEditManagedContent(editor)).toBe(true);
    expect(isAdmin(editor)).toBe(false);
    expect(canAccessDashboard(viewer)).toBe(true);
    expect(canEditManagedContent(viewer)).toBe(false);
    expect(getRoleFromClaims({ user_metadata: { role: "admin" } })).toBe("user");
  });

  it("enforces editor writes and admin-only deletes on the server", () => {
    expect(() => requireContentEditorRole({ app_metadata: { role: "editor" } })).not.toThrow();
    expect(() => requireContentEditorRole({ app_metadata: { role: "viewer" } })).toThrow(
      "Forbidden",
    );
    expect(() => requireAdminRole({ app_metadata: { role: "editor" } })).toThrow("Forbidden");
    expect(() => requireAdminRole({ user_metadata: { role: "admin" } })).toThrow("Forbidden");
  });

  it("handles null or undefined user safely", () => {
    expect(getUserRole(null)).toBe("user");
    expect(getUserRole(undefined)).toBe("user");
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });

  it("extracts readable display name properly", () => {
    expect(getUserDisplayName(mockUser({ user_metadata: { full_name: "John Doe" } }))).toBe(
      "John Doe",
    );
    expect(getUserDisplayName(mockUser({ user_metadata: { name: "Jane Doe" } }))).toBe("Jane Doe");
    expect(getUserDisplayName(mockUser({ email: "mostafa@example.com" }))).toBe("mostafa");
    expect(getUserDisplayName(null)).toBe("");
  });
});

describe("describeAuthError maps provider text to i18n keys", () => {
  const t = (key: string) => `«${key}»`;

  it("maps the known sign-in failures (the grant_type=password 400s)", () => {
    expect(describeAuthError(t, "Invalid login credentials")).toBe("«auth.invalidCredentials»");
    expect(describeAuthError(t, "Email not confirmed")).toBe("«auth.emailNotConfirmed»");
    expect(describeAuthError(t, "User already registered")).toBe("«auth.alreadyRegistered»");
    expect(describeAuthError(t, "Email rate limit exceeded")).toBe("«auth.tooManyAttempts»");
    expect(describeAuthError(t, "Too many requests")).toBe("«auth.tooManyAttempts»");
  });

  it("matching is case-insensitive", () => {
    expect(describeAuthError(t, "INVALID LOGIN CREDENTIALS")).toBe("«auth.invalidCredentials»");
  });

  it("never leaks raw provider text into the UI", () => {
    expect(describeAuthError(t, "Internal provider error 500")).toBe("«auth.requestFailed»");
    expect(describeAuthError(t, "")).toBe("«auth.requestFailed»");
  });
});
