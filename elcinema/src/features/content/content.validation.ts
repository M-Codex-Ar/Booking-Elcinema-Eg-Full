import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const requiredText = (max: number) => text(max).min(1);
const optionalUrl = z.string().url().max(2_048).nullable();
const itemSchema = z
  .object({
    ref: requiredText(128),
    title_en: requiredText(300),
    title_ar: text(300),
  })
  .strict();

export const managedRowSchemas = {
  managed_movies: z
    .object({
      title_en: requiredText(300),
      title_ar: text(300),
      genre: text(500),
      year: z.number().int().min(1888).max(3000).nullable(),
      release_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable(),
      status: z.enum(["now", "soon"]),
      rating: z.number().min(0).max(10).nullable(),
      runtime: z.number().int().min(0).max(1_000),
      cert: text(50),
      director_en: text(300),
      director_ar: text(300),
      synopsis_en: text(20_000),
      synopsis_ar: text(20_000),
      poster_url: optionalUrl,
    })
    .strict(),
  managed_people: z
    .object({
      name_en: requiredText(300),
      name_ar: text(300),
      role_en: text(300),
      role_ar: text(300),
      bio: text(20_000),
      photo_url: optionalUrl,
    })
    .strict(),
  managed_boxoffice: z
    .object({
      title_en: requiredText(300),
      title_ar: text(300),
      weekly_egp: z.number().finite().min(0).max(999_999_999_999.99),
      total_egp: z.number().finite().min(0).max(999_999_999_999.99),
      note: text(2_000),
    })
    .strict(),
  managed_channels: z
    .object({
      name_en: requiredText(300),
      name_ar: text(300),
      category: requiredText(80),
      logo_url: optionalUrl,
    })
    .strict(),
  managed_programs: z
    .object({
      channel_id: z.string().uuid(),
      title_en: requiredText(300),
      title_ar: text(300),
      start_min: z.number().int().min(0).max(1439),
      end_min: z.number().int().min(1).max(1440),
      meta: text(2_000),
    })
    .strict()
    .refine((program) => program.end_min > program.start_min, {
      message: "Program end must be after its start",
      path: ["end_min"],
    }),
  managed_videos: z
    .object({
      title_en: requiredText(300),
      title_ar: text(300),
      url: z.string().url().max(2_048),
      thumb_url: optionalUrl,
      duration: text(80),
    })
    .strict(),
  managed_lists: z
    .object({
      title_en: requiredText(300),
      title_ar: text(300),
      items: z.array(itemSchema).max(100),
    })
    .strict(),
} as const;

export const MANAGED_TABLES = Object.keys(managedRowSchemas) as (keyof typeof managedRowSchemas)[];
export type ManagedTable = keyof typeof managedRowSchemas;

export type ManagedRowInput = {
  table: ManagedTable;
  row: Record<string, unknown>;
  id?: string;
};

export function validateManagedRowInput(input: unknown): ManagedRowInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid managed content input");
  }
  const value = input as Record<string, unknown>;
  if (!MANAGED_TABLES.includes(value["table"] as ManagedTable)) {
    throw new Error("Unknown content table");
  }
  if (!value["row"] || typeof value["row"] !== "object" || Array.isArray(value["row"])) {
    throw new Error("Invalid managed content row");
  }
  const table = value["table"] as ManagedTable;
  const row = managedRowSchemas[table].parse(value["row"]);
  const id = value["id"] === undefined ? undefined : z.string().uuid().parse(value["id"]);
  return { table, row: row as Record<string, unknown>, ...(id ? { id } : {}) };
}
