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

if (merged.SKIP_ENV_CHECK === "1") {
  console.warn("[check-env] SKIP_ENV_CHECK=1 — building without verifying Supabase config.");
  process.exit(0);
}

const present = (name) => Boolean(merged[name] && String(merged[name]).trim());

const missing = REQUIRED.filter((name) => !present(name));
const missingRuntime = RUNTIME.filter((name) => !present(name));

if (missing.length > 0) {
  console.error(`[check-env] Build would ship a broken bundle. Missing: ${missing.join(", ")}`);
  console.error(
    fileEnv["__found"] === undefined && !fs.existsSync(envPath)
      ? "[check-env] No elcinema/.env found — copy elcinema/.env.example to elcinema/.env and fill in the publishable values from Lovable Cloud (Settings → Connect Supabase)."
      : "[check-env] elcinema/.env exists but does not define the variables above.",
  );
  console.error("[check-env] Docs: docs/operations.md#environment-variables");
  process.exit(1);
}

if (missingRuntime.length > 0) {
  console.warn(
    `[check-env] Server-side variables not set (${missingRuntime.join(", ")}): dashboard writes and managed-content reads will fail at runtime.`,
  );
}

console.log("[check-env] Supabase browser config present.");
