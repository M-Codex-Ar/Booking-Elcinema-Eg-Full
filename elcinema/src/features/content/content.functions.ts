/** Server functions for dashboard-managed site content. */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/services/clients/supabase/types";
import { requireSupabaseAuth } from "@/services/clients/supabase/auth-middleware";
import { requireAdminRole, requireContentEditorRole } from "@/features/auth/auth";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase-env";
import { z } from "zod";
import { MANAGED_TABLES, type ManagedTable, validateManagedRowInput } from "./content.validation";

export { MANAGED_TABLES };
export type { ManagedTable };
const MANAGED_READ_TIMEOUT_MS = 5_000;
const MANAGED_CONTENT_CACHE_MS = 30_000;

type ManagedRowFor<T extends ManagedTable> = Database["public"]["Tables"][T]["Row"];
type ManagedContentPayload = {
  movies: ManagedRowFor<"managed_movies">[];
  people: ManagedRowFor<"managed_people">[];
  boxoffice: ManagedRowFor<"managed_boxoffice">[];
  channels: ManagedRowFor<"managed_channels">[];
  programs: ManagedRowFor<"managed_programs">[];
  videos: ManagedRowFor<"managed_videos">[];
  lists: ManagedRowFor<"managed_lists">[];
  /** Table names whose reads failed; public pages can still use catalogue fallbacks. */
  errors?: string[];
};

let managedContentCache: { value: ManagedContentPayload; expiresAt: number } | undefined;
let managedContentGeneration = 0;
let managedContentInFlight:
  { generation: number; promise: Promise<ManagedContentPayload> } | undefined;

/** Opaque sb_ keys are not JWTs: send apikey, never a Bearer of the key. */
function createKeyFetch(supabaseKey: string, requestSignal: AbortSignal): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
    headers.set("apikey", supabaseKey);
    const timeout = AbortSignal.timeout(MANAGED_READ_TIMEOUT_MS);
    const signal = AbortSignal.any([
      requestSignal,
      timeout,
      ...(init?.signal ? [init.signal] : []),
    ]);
    return fetch(input, { ...init, headers, signal });
  };
}

function emptyManagedContent(errors: string[] = []): ManagedContentPayload {
  return {
    movies: [],
    people: [],
    boxoffice: [],
    channels: [],
    programs: [],
    videos: [],
    lists: [],
    errors,
  };
}

function invalidateManagedContentCache() {
  managedContentGeneration += 1;
  managedContentCache = undefined;
  managedContentInFlight = undefined;
}

async function readManagedContent(url: string, key: string): Promise<ManagedContentPayload> {
  const controller = new AbortController();
  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: createKeyFetch(key, controller.signal) },
  });
  const q = async <T extends ManagedTable>(table: T) => {
    try {
      const { data, error } = await supabase.from(table).select("*");
      if (error) {
        console.warn(`[managed-content] Failed to read ${table}: ${error.message}`);
        return { rows: [] as ManagedRowFor<T>[], error: table };
      }
      return { rows: (data ?? []) as unknown as ManagedRowFor<T>[], error: null };
    } catch (error) {
      // Managed additions are optional. A slow or unavailable table must not
      // hold up the built-in public catalogue or fail the entire route.
      console.warn(
        `[managed-content] Failed to read ${table}: ${error instanceof Error ? error.message : "unknown error"}`,
      );
      return { rows: [] as ManagedRowFor<T>[], error: table };
    }
  };

  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutResult = new Promise<ManagedContentPayload>((resolve) => {
    timeout = setTimeout(() => {
      controller.abort();
      resolve(emptyManagedContent(["timeout"]));
    }, MANAGED_READ_TIMEOUT_MS);
  });
  try {
    const reads = Promise.all([
      q("managed_movies"),
      q("managed_people"),
      q("managed_boxoffice"),
      q("managed_channels"),
      q("managed_programs"),
      q("managed_videos"),
      q("managed_lists"),
    ]).then(([movies, people, boxoffice, channels, programs, videos, lists]) => ({
      movies: movies.rows,
      people: people.rows,
      boxoffice: boxoffice.rows,
      channels: channels.rows,
      programs: programs.rows,
      videos: videos.rows,
      lists: lists.rows,
      errors: [movies, people, boxoffice, channels, programs, videos, lists].flatMap((result) =>
        result.error ? [result.error] : [],
      ),
    }));
    return await Promise.race([reads, timeoutResult]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function refreshManagedContent(url: string, key: string): Promise<ManagedContentPayload> {
  if (managedContentInFlight?.generation === managedContentGeneration) {
    return managedContentInFlight.promise;
  }
  const generation = managedContentGeneration;
  const promise = readManagedContent(url, key)
    .then((value) => {
      if (generation === managedContentGeneration) {
        const hasRows = Object.entries(value).some(
          ([key, rows]) => key !== "errors" && Array.isArray(rows) && rows.length > 0,
        );
        managedContentCache = {
          value,
          // Errors and empty results retry quickly; a real outage must not be
          // cached as a successful empty catalogue for the full cache window.
          expiresAt:
            Date.now() +
            (value.errors?.length ? 5_000 : hasRows ? MANAGED_CONTENT_CACHE_MS : 5_000),
        };
      }
      return value;
    })
    .finally(() => {
      if (managedContentInFlight?.promise === promise) managedContentInFlight = undefined;
    });
  managedContentInFlight = { generation, promise };
  return promise;
}

/** Everything the dashboard manages, read with the publishable client.
 * Public pages merge this with the built-in catalogue; safe under the
 * anon SELECT policies. */
export const getManagedContent = createServerFn({ method: "GET" }).handler(async () => {
  // Read through the same environment resolver as the generated Supabase
  // client. Vercel/Lovable commonly expose the VITE_ variables at build time;
  // relying on server-only aliases silently hid all managed homepage sections.
  const url = supabaseUrl();
  const key = supabasePublishableKey();
  if (!url || !key) return emptyManagedContent(["configuration"]);
  if (managedContentCache && managedContentCache.expiresAt > Date.now()) {
    return managedContentCache.value;
  }
  if (managedContentCache) {
    // Stale data is immediately usable; refresh it without making the caller
    // wait for a slow database connection or cold start.
    void refreshManagedContent(url, key).catch(() => undefined);
    return managedContentCache.value;
  }
  return refreshManagedContent(url, key).catch((error: unknown) => {
    console.warn(
      `[managed-content] Read failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return emptyManagedContent(["unavailable"]);
  });
});

export type ManagedContent = Awaited<ReturnType<typeof getManagedContent>>;

/** Staff-only write (RLS: authenticated admin/editor); admin-only delete. */
export const saveManagedRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(validateManagedRowInput)
  .handler(async ({ data, context }) => {
    requireContentEditorRole(context.claims as Record<string, unknown> | undefined);
    const row = { ...data.row, updated_at: new Date().toISOString() };
    const table = context.supabase.from(data.table as never);
    const result = data.id
      ? await table
          .update(row as never)
          .eq("id" as never, data.id)
          .select("id")
          .maybeSingle()
      : await table
          .insert(row as never)
          .select("id")
          .single();
    if (result.error) {
      console.error(`[managed-content] Failed to save ${data.table}: ${result.error.message}`);
      throw new Error("Managed content could not be saved.");
    }
    if (!result.data) throw new Error("Managed content entry was not found.");
    invalidateManagedContentCache();
    return { ok: true };
  });

/** Staff-only delete (RLS: authenticated admin). */
export const deleteManagedRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        table: z.enum(MANAGED_TABLES as [ManagedTable, ...ManagedTable[]]),
        id: z.string().uuid(),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!data || !MANAGED_TABLES.includes(data.table)) throw new Error("Unknown content table");
    requireAdminRole(context.claims as Record<string, unknown> | undefined);
    const { data: deleted, error } = await context.supabase
      .from(data.table as never)
      .delete()
      .eq("id", data.id)
      .select("id")
      .maybeSingle();
    if (error) {
      console.error(`[managed-content] Failed to delete ${data.table}: ${error.message}`);
      throw new Error("Managed content could not be deleted.");
    }
    if (!deleted) throw new Error("Managed content entry was not found.");
    invalidateManagedContentCache();
    return { ok: true };
  });
