import { describe, expect, it } from "vitest";
import { validateManagedRowInput } from "@/features/content/content.validation";

describe("managed content server input validation", () => {
  it("has a valid schema for every managed collection", () => {
    const inputs = [
      {
        table: "managed_movies",
        row: {
          title_en: "Film",
          title_ar: "",
          genre: "",
          year: null,
          release_date: null,
          status: "now",
          rating: null,
          runtime: 0,
          cert: "",
          director_en: "",
          director_ar: "",
          synopsis_en: "",
          synopsis_ar: "",
          poster_url: null,
        },
      },
      {
        table: "managed_people",
        row: {
          name_en: "Person",
          name_ar: "",
          role_en: "Actor",
          role_ar: "",
          bio: "",
          photo_url: null,
        },
      },
      {
        table: "managed_boxoffice",
        row: { title_en: "Film", title_ar: "", weekly_egp: 0, total_egp: 0, note: "" },
      },
      {
        table: "managed_channels",
        row: { name_en: "Channel", name_ar: "", category: "general", logo_url: null },
      },
      {
        table: "managed_programs",
        row: {
          channel_id: "0f28ad34-ece5-4d0a-80cd-a7a92bc81818",
          title_en: "Program",
          title_ar: "",
          start_min: 600,
          end_min: 660,
          meta: "",
        },
      },
      {
        table: "managed_videos",
        row: {
          title_en: "Video",
          title_ar: "",
          url: "https://example.com/video",
          thumb_url: null,
          duration: "",
        },
      },
      { table: "managed_lists", row: { title_en: "List", title_ar: "", items: [] } },
    ] as const;

    for (const input of inputs) expect(() => validateManagedRowInput(input)).not.toThrow();
  });

  it("accepts a valid managed movie row and separates its update id", () => {
    const id = "0f28ad34-ece5-4d0a-80cd-a7a92bc81818";
    expect(
      validateManagedRowInput({
        table: "managed_movies",
        id,
        row: {
          title_en: "Example Film",
          title_ar: "فيلم تجريبي",
          genre: "drama",
          year: 2025,
          release_date: null,
          status: "now",
          rating: 7.5,
          runtime: 110,
          cert: "PG",
          director_en: "Director",
          director_ar: "",
          synopsis_en: "A short synopsis.",
          synopsis_ar: "",
          poster_url: null,
        },
      }),
    ).toMatchObject({ table: "managed_movies", id, row: { title_en: "Example Film" } });
  });

  it("rejects unknown columns instead of passing them to Postgres", () => {
    expect(() =>
      validateManagedRowInput({
        table: "managed_people",
        row: { name_en: "Person", role_en: "Actor", role: "admin" },
      }),
    ).toThrow();
  });

  it("rejects invalid ranges, statuses, URLs and schedule windows", () => {
    expect(() =>
      validateManagedRowInput({
        table: "managed_boxoffice",
        row: { title_en: "Film", title_ar: "", weekly_egp: -1, total_egp: 0, note: "" },
      }),
    ).toThrow();
    expect(() =>
      validateManagedRowInput({
        table: "managed_movies",
        row: {
          title_en: "Film",
          title_ar: "",
          genre: "",
          year: null,
          release_date: null,
          status: "archived",
          rating: null,
          runtime: 0,
          cert: "",
          director_en: "",
          director_ar: "",
          synopsis_en: "",
          synopsis_ar: "",
          poster_url: "javascript:alert(1)",
        },
      }),
    ).toThrow();
    expect(() =>
      validateManagedRowInput({
        table: "managed_programs",
        row: {
          channel_id: "0f28ad34-ece5-4d0a-80cd-a7a92bc81818",
          title_en: "Program",
          title_ar: "",
          start_min: 600,
          end_min: 600,
          meta: "",
        },
      }),
    ).toThrow();
  });

  it("rejects malformed IDs and unknown tables", () => {
    expect(() =>
      validateManagedRowInput({ table: "managed_lists", id: "not-a-uuid", row: {} }),
    ).toThrow();
    expect(() => validateManagedRowInput({ table: "profiles", row: {} })).toThrow();
  });
});
