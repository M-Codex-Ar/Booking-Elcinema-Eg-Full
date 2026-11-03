import { afterEach, describe, expect, it, vi } from "vitest";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase-env";

/**
 * A build without the publishable env must be detectable before anything reads
 * `supabase` — the generated client throws on first property access, and until
 * PR #2's root auth subscription the throw took every public page with it.
 */
describe("Supabase browser env probe", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports configured when both VITE_ vars are inlined", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_abc");
    expect(isSupabaseConfigured()).toBe(true);
    expect(supabaseUrl()).toBe("https://example.supabase.co");
    expect(supabasePublishableKey()).toBe("sb_publishable_abc");
  });

  it("reports unconfigured when either var is missing", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    expect(isSupabaseConfigured()).toBe(false);

    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_abc");
    vi.stubEnv("VITE_SUPABASE_URL", "");
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("falls back to process.env for server rendering", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("SUPABASE_URL", "https://internal.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_xyz");
    expect(isSupabaseConfigured()).toBe(true);
  });
});
