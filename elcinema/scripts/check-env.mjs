/**
 * Build-time environment gate for the elcinema app.
 *
 * Why this exists: the Vite build silently inlines whatever it finds. Run it
 * without `.env` and you get a green build and a deployable bundle that throws
 * on every page — `src/integrations/supabase/client.ts` raises
 * "Missing Supabase environment variable(s)" the first time any component
 * touches the client. Fail here instead, before the artifact ships.
 *
 * Usage:  node scripts/check-env.mjs        (also runs as part of `bun run build`)
 * Escape hatch for env-free builds (docs, previews): SKIP_ENV_CHECK=1
 *
 * Strictness by environment: a Vercel *preview* build usually has no secrets —
 * project environment variables are not shared with forked pull requests — and
 * a preview is exactly where a missing value should be reported, not where it
 * should stop the build. The bundle no longer blanks without Supabase (the
 * client is lazy and every auth form says `auth.notEnabled`), so a preview is
 * still reviewable. Production, local and any unknown builder stay strict.
 * Override with CHECK_ENV=strict|warn|off.
 *
 * Never prints values — only names, so the log is safe to paste into an issue.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");

/** Variables the browser bundle needs, in the order the client looks them up. */
const REQUIRED = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
/** Variables the SSR/edge runtime needs; absent only degrades server data. */
const RUNTIME = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"];

function loadEnvFile() {
  const values = {};
  if (!fs.existsSync(envPath)) return values;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z0-9_]+)=(?:"([^"]*)"|'([^']*)'|(.*))$/);
    if (match) values[match[1]] = (match[2] ?? match[3] ?? match[4] ?? "").trim();
  }
  return values;
}

const fileEnv = loadEnvFile();
// Real environment wins over the file, exactly like Vite's loader.
const merged = { ...fileEnv, ...process.env };

if (merged.SKIP_ENV_CHECK === "1" || merged.CHECK_ENV === "off") {
  console.warn(
    `[check-env] ${merged.SKIP_ENV_CHECK === "1" ? "SKIP_ENV_CHECK=1" : "CHECK_ENV=off"} — building without verifying Supabase config.`,
  );
  process.exit(0);
}

const present = (name) => Boolean(merged[name] && String(merged[name]).trim());

// Where this build is going decides how loud the check is allowed to be.
// Any Vercel build (preview or production without dashboard secrets configured yet)
// reports a warning rather than killing the deploy, because the client is lazy and
// missing values degrade gracefully without blanking. Local builds without a .env
// or builders with CHECK_ENV=strict stay strict.
const mode = merged.CHECK_ENV || (merged.VERCEL || merged.VERCEL_ENV ? "warn" : "strict");

const missing = REQUIRED.filter((name) => !present(name));
const missingRuntime = RUNTIME.filter((name) => !present(name));

if (missing.length > 0) {
  const where = merged.VERCEL_ENV ? `VERCEL_ENV=${merged.VERCEL_ENV}` : "no host env detected";
  if (mode === "strict") {
    console.error(
      `[check-env] Build would ship without Supabase config (${where}). Missing: ${missing.join(", ")}`,
    );
    console.error(
      !fs.existsSync(envPath)
        ? "[check-env] No elcinema/.env found — copy elcinema/.env.example to elcinema/.env and fill in the publishable values from Lovable Cloud (Settings → Connect Supabase)."
        : "[check-env] elcinema/.env exists but does not define the variables above.",
    );
    console.error(
      "[check-env] On a host, set them in the project's environment variables (Vercel: Settings → Environment Variables, scope Production *and* Preview).",
    );
    console.error("[check-env] Docs: docs/operations.md#environment-variables");
    process.exit(1);
  }
  console.warn(
    `[check-env] Building without ${missing.join(", ")} (${where}): public pages still render, but sign-in and the dashboard will report "not enabled".`,
  );
  console.warn(
    "[check-env] To get a fully working preview, add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the Preview scope (both are publishable-key values, safe in a browser bundle).",
  );
}

if (missingRuntime.length > 0) {
  console.warn(
    `[check-env] Server-side variables not set (${missingRuntime.join(", ")}): dashboard writes and managed-content reads will fail at runtime.`,
  );
}

if (missing.length === 0) console.log("[check-env] Supabase browser config present.");
