/**
 * Supabase Auth Seed Script for elCinema.
 * Creates / updates:
 *   1. Admin account: admin@elcinema.com / Admin123456! (role: admin)
 *   2. Test user account: user@elcinema.com / User123456! (role: user)
 *
 * Usage:
 *   cd elcinema && node scripts/seed-admin.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

function loadEnv() {
  const env = { ...process.env };
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([A-Za-z0-9_]+)=(?:"([^"]*)"|'([^']*)'|(.*))$/);
      if (match) {
        const key = match[1];
        const val = match[2] ?? match[3] ?? match[4] ?? "";
        if (!env[key]) env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsertAccount({ email, password, fullName, role }) {
  console.log(`Checking account ${email}...`);
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  const existing = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    console.log(`User ${email} already exists (id: ${existing.id}). Updating role & password...`);
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      existing.id,
      {
        password,
        email_confirm: true,
        user_metadata: {
          ...existing.user_metadata,
          full_name: fullName,
          role,
        },
        app_metadata: {
          ...existing.app_metadata,
          role,
        },
      },
    );
    if (updateError) {
      throw new Error(`Failed to update ${email}: ${updateError.message}`);
    }
    console.log(`✓ Account ${email} updated successfully! Role: ${role}`);
    return updateData.user;
  } else {
    console.log(`Creating user ${email}...`);
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
      app_metadata: {
        role,
      },
    });
    if (createError) {
      throw new Error(`Failed to create ${email}: ${createError.message}`);
    }
    console.log(
      `✓ Account ${email} created successfully (id: ${createData.user.id})! Role: ${role}`,
    );
    return createData.user;
  }
}

async function run() {
  console.log("=== Seeding elCinema Supabase Auth Accounts ===");
  console.log(`Supabase URL: ${url}`);

  try {
    // 1. Admin Seed
    await upsertAccount({
      email: "admin@elcinema.com",
      password: "Admin123456!",
      fullName: "elCinema Admin",
      role: "admin",
    });

    // 2. Regular User Seed
    await upsertAccount({
      email: "user@elcinema.com",
      password: "User123456!",
      fullName: "elCinema Regular User",
      role: "user",
    });

    console.log("\n================================================");
    console.log("Seed complete! Credentials:");
    console.log("  [Admin]   Email: admin@elcinema.com | Password: Admin123456!");
    console.log("            Permissions: Full dashboard access & catalogue edits");
    console.log("  [User]    Email: user@elcinema.com  | Password: User123456!");
    console.log("            Permissions: Regular browsing, no dashboard access");
    console.log("================================================\n");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

run();
