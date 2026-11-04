/** Server functions for dashboard-managed site content. */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/services/clients/supabase/types";
import { requireSupabaseAuth } from "@/services/clients/supabase/auth-middleware";
import { requireAdminRole } from "@/features/auth/auth";

export const MANAGED_TABLES = [
  "managed_movies",
  "managed_people",
  "managed_boxoffice",
  "managed_channels",
  "managed_programs",
  "managed_videos",
  "managed_lists",
] as const;
export type ManagedTable = (typeof MANAGED_TABLES)[number];
const MANAGED_READ_TIMEOUT_MS = 1_200;

/** Opaque sb_ keys are not JWTs: send apikey, never a Bearer of the key. */
function createKeyFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
    headers.set("apikey", supabaseKey);
    const timeout = AbortSignal.timeout(MANAGED_READ_TIMEOUT_MS);
    const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
    return fetch(input, { ...init, headers, signal });
  };
}

/** Everything the dashboard manages, read with the publishable client.
 * Public pages merge this with the built-in catalogue; safe under the
 * anon SELECT policies. */
export const getManagedContent = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    return {
      movies: [],
      people: [],
      boxoffice: [],
      channels: [],
      programs: [],
      videos: [],
      lists: [],
    };
  }
  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: createKeyFetch(key) },
  });
  const q = async (table: ManagedTable) => {
    try {
      const { data, error } = await supabase.from(table).select("*");
      return error ? [] : (data ?? []);
    } catch {
      // Managed additions are optional. A slow or unavailable table must not
      // hold up the built-in public catalogue or fail the entire route.
      return [];
    }
  };
  const [movies, people, boxoffice, channels, programs, videos, lists] = await Promise.all([
    q("managed_movies"),
    q("managed_people"),
    q("managed_boxoffice"),
    q("managed_channels"),
    q("managed_programs"),
    q("managed_videos"),
    q("managed_lists"),
  ]);
  return { movies, people, boxoffice, channels, programs, videos, lists };
});

export type ManagedContent = Awaited<ReturnType<typeof getManagedContent>>;

export type ManagedRow = Record<string, unknown> & { id?: string };

/** Staff-only write (RLS: authenticated admin). `row.id` present => update. */
export const saveManagedRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { table: ManagedTable; row: ManagedRow } | null) => input)
  .handler(async ({ data, context }) => {
    if (!data || !MANAGED_TABLES.includes(data.table)) throw new Error("Unknown content table");
    requireAdminRole(context.claims as Record<string, unknown> | undefined);
    const row: Record<string, unknown> = { ...data.row };
    delete row["created_at"];
    row["updated_at"] = new Date().toISOString();
    const id = typeof row["id"] === "string" && row["id"] ? row["id"] : null;
    delete row["id"];
    const table = context.supabase.from(data.table as never);
    const { error } = id
      ? await table.update(row as never).eq("id" as never, id)
      : await table.insert(row as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Staff-only delete (RLS: authenticated admin). */
export const deleteManagedRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { table: ManagedTable; id: string } | null) => input)
  .handler(async ({ data, context }) => {
    if (!data || !MANAGED_TABLES.includes(data.table)) throw new Error("Unknown content table");
    requireAdminRole(context.claims as Record<string, unknown> | undefined);
    const { error } = await context.supabase
      .from(data.table as never)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
