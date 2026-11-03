import { describe, expect, it } from "vitest";
import { getUserRole, isAdmin, getUserDisplayName } from "../elcinema/auth";
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

  it("detects admin from user_metadata", () => {
    const adminUser = mockUser({
      user_metadata: { role: "admin" },
      email: "staff@example.com",
    });
    expect(getUserRole(adminUser)).toBe("admin");
    expect(isAdmin(adminUser)).toBe(true);
  });

  it("detects admin from seed email admin@elcinema.com", () => {
    const adminUser = mockUser({
      email: "admin@elcinema.com",
    });
    expect(getUserRole(adminUser)).toBe("admin");
    expect(isAdmin(adminUser)).toBe(true);
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
