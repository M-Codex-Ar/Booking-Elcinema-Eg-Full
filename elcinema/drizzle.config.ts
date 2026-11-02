import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    // LOVABLE_DB_MIGRATION_URL takes priority; falls back to the Supabase non-pooling URL
    // which supports DDL statements (no pgBouncer).
    url: process.env.LOVABLE_DB_MIGRATION_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? "",
  },
});
