/**
 * Dashboard CRUD toolkit: generic row dialogs, delete actions and the
 * per-section managers for every piece of managed site content.
 */
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/services/clients/supabase/client";
import { DataTable, type Col } from "./DataTable";
import { matchesBuiltinMovie, matchesBuiltinPerson } from "@/features/content/content";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENRES } from "@/lib/data";
import { PosterArt, fmtDate } from "@/components/shared/ui";
import { ImgWithFallback, Pill } from "@/components/shared/primitives";
import type { Lang, Movie } from "@/types/home";
import { pair as L } from "@/i18n";
import type { ManagedContent } from "@/features/content/content.functions";
import {
  allMovies,
  managedBoxofficeRows,
  managedChannels,
  managedLists,
  managedMovies,
  managedPeople,
  managedPrograms,
  managedVideos,
  type ManagedBoxofficeRow,
  type ManagedChannelRow,
  type ManagedListRow,
  type ManagedMovieRow,
  type ManagedPersonRow,
  type ManagedProgramRow,
  type ManagedVideoRow,
} from "@/features/content/content";

/**
 * Caution next to an entry that repeats built-in content. One definition so the
 * warning looks identical everywhere; the colour is the `gold` token, not a
 * literal.
 */
function DuplicateBadge({ title, label }: { title: string; label: string }) {
  return (
    <Pill tone="warning" title={title} className="shrink-0 rounded-full px-2 py-0.5 text-micro">
      {label}
    </Pill>
  );
}

// ---------------------------------------------------------------- generic form

export interface FieldDef {
  key: string;
  en: string;
  ar: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "time" | "url";
  options?: { value: string; label: string }[];
  full?: boolean;
}

type Form = Record<string, string>;

const minutesToTime = (min: number) =>
  `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

function toCellValue(field: FieldDef, raw: string): unknown {
  const v = raw.trim();
  if (field.type === "number") return v === "" ? null : Number(v);
  if (field.type === "time") return v === "" ? 0 : timeToMinutes(v);
  return v;
}

function RowDialog({
  lang,
  title,
  fields,
  initial,
  open,
  onClose,
  onSubmit,
  busy,
}: {
  lang: Lang;
  title: string;
  fields: FieldDef[];
  initial: Form;
  open: boolean;
  onClose: () => void;
  onSubmit: (form: Form) => void;
  busy?: boolean;
}) {
  const [form, setForm] = useState<Form>(initial);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls = "w-full";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="dialog-scroll border-border bg-card sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-black">{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {fields.map((f) => (
            <label
              key={f.key}
              className={`grid gap-1.5 ${f.full || f.type === "textarea" ? "sm:col-span-2" : ""}`}
            >
              <span className="text-xs font-semibold text-muted-foreground">
                {L(lang, f.en, f.ar)}
              </span>
              {f.type === "textarea" ? (
                <Textarea
                  rows={4}
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputCls}
                />
              ) : f.type === "select" ? (
                <Select value={form[f.key] ?? ""} onValueChange={(v) => set(f.key, v)}>
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(f.options ?? []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={
                    f.type === "number"
                      ? "number"
                      : f.type === "date"
                        ? "date"
                        : f.type === "time"
                          ? "time"
                          : "text"
                  }
                  step={f.type === "number" ? "any" : undefined}
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputCls}
                />
              )}
            </label>
          ))}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {L(lang, "Cancel", "إلغاء")}
            </Button>
            <Button type="submit" disabled={busy}>
              {L(lang, "Save", "حفظ")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------------ CRUD shell

interface CrudSpec<T extends { id: string }> {
  lang: Lang;
  table:
    | "managed_movies"
    | "managed_people"
    | "managed_boxoffice"
    | "managed_channels"
    | "managed_programs"
    | "managed_videos"
    | "managed_lists";
  rows: T[];
  cols: Col<T>[];
  fields: FieldDef[];
  blank: Form;
  toForm: (row: T) => Form;
  toRow: (form: Form, editing: T | null) => Record<string, unknown>;
  addLabel: string;
  editTitle: string;
  addTitle: string;
  extra?: React.ReactNode;
}

function useContentInvalidator() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["managed-content"] });
}

export function CrudSection<T extends { id: string }>(spec: CrudSpec<T>) {
  const { lang, table, rows, cols, fields, blank, toForm, toRow, addLabel, addTitle, editTitle } =
    spec;
  const invalidate = useContentInvalidator();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const save = useMutation({
    mutationFn: async (values: Form) => {
      const payload = toRow(values, editing);
      const id = editing?.id;
      const { error } = id
        ? await supabase
            .from(table)
            .update(payload as never)
            .eq("id" as never, id)
        : await supabase.from(table).insert(payload as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success(L(lang, "Saved", "تم الحفظ"));
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success(L(lang, "Deleted", "تم الحذف"));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const actionCol: Col<T> = {
    key: "actions",
    label: "",
    value: () => "",
    render: (row) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={L(lang, "Edit", "تعديل")}
          onClick={() => {
            setEditing(row);
            setForm(toForm(row));
            setOpen(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          aria-label={L(lang, "Delete", "حذف")}
          onClick={() => {
            if (window.confirm(L(lang, "Delete this entry?", "حذف هذا العنصر؟")))
              remove.mutate(row.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {rows.length} {L(lang, "entries", "عنصر")}
        </span>
        <Button
          className="ms-auto"
          onClick={() => {
            setEditing(null);
            setForm(blank);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      </div>
      {spec.extra}
      <DataTable lang={lang} rows={rows} cols={[...cols, actionCol]} />
      <RowDialog
        key={editing?.id ?? "new"}
        lang={lang}
        title={editing ? editTitle : addTitle}
        fields={fields}
        initial={form}
        open={open}
        busy={save.isPending}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSubmit={(f) => save.mutate(f)}
      />
    </div>
  );
}

// ------------------------------------------------------------------- sections

const genreOptions = Object.entries(GENRES).map(([value, label]) => ({ value, label: label.en }));
const STATUS_OPTIONS = (lang: Lang) => [
  { value: "now", label: L(lang, "Now playing", "يعرض الآن") },
  { value: "soon", label: L(lang, "Coming soon", "قريباً") },
];

/** Dashboard table thumbnail: a muted box stands in for missing or dead artwork. */
function Thumb({ src, wide }: { src: string | null; wide?: boolean }) {
  const box = `shrink-0 rounded bg-muted ${wide ? "h-9 w-16" : "h-10 w-7"}`;
  return <ImgWithFallback src={src} alt="" className={box} fallback={<div className={box} />} />;
}

export function MoviesManager({ lang, data }: { lang: Lang; data: ManagedContent }) {
  const rows = managedMovies(data);
  return (
    <CrudSection<ManagedMovieRow>
      lang={lang}
      table="managed_movies"
      rows={rows}
      addLabel={L(lang, "Add movie", "إضافة فيلم")}
      addTitle={L(lang, "Add movie", "إضافة فيلم")}
      editTitle={L(lang, "Edit movie", "تعديل فيلم")}
      blank={{
        title_en: "",
        title_ar: "",
        genre: "",
        year: "",
        release_date: "",
        status: "now",
        rating: "",
        runtime: "",
        cert: "",
        director_en: "",
        director_ar: "",
        synopsis_en: "",
        synopsis_ar: "",
        poster_url: "",
      }}
      toForm={(r) => ({
        title_en: r.title_en,
        title_ar: r.title_ar,
        genre: r.genre,
        year: r.year?.toString() ?? "",
        release_date: r.release_date ?? "",
        status: r.status,
        rating: r.rating?.toString() ?? "",
        runtime: r.runtime ? String(r.runtime) : "",
        cert: r.cert,
        director_en: r.director_en,
        director_ar: r.director_ar,
        synopsis_en: r.synopsis_en,
        synopsis_ar: r.synopsis_ar,
        poster_url: r.poster_url ?? "",
      })}
      toRow={(f) => {
        const g = (k: string) => f[k] ?? "";
        return {
          title_en: g("title_en").trim(),
          title_ar: g("title_ar").trim(),
          genre: g("genre"),
          year: g("year") ? Number(g("year")) : null,
          release_date: g("release_date") || null,
          status: g("status") || "now",
          rating: g("rating") ? Number(g("rating")) : null,
          runtime: g("runtime") ? Number(g("runtime")) : 0,
          cert: g("cert").trim(),
          director_en: g("director_en").trim(),
          director_ar: g("director_ar").trim(),
          synopsis_en: g("synopsis_en").trim(),
          synopsis_ar: g("synopsis_ar").trim(),
          poster_url: g("poster_url").trim() || null,
        };
      }}
      fields={[
        { key: "title_en", en: "Title (English)", ar: "العنوان (إنجليزي)" },
        { key: "title_ar", en: "Title (Arabic)", ar: "العنوان (عربي)" },
        { key: "genre", en: "Genre", ar: "النوع", type: "select", options: genreOptions },
        {
          key: "status",
          en: "Status",
          ar: "الحالة",
          type: "select",
          options: STATUS_OPTIONS(lang),
        },
        { key: "year", en: "Year", ar: "السنة", type: "number" },
        { key: "release_date", en: "Release date", ar: "تاريخ العرض", type: "date" },
        { key: "rating", en: "Rating (0–10)", ar: "التقييم (٠–١٠)", type: "number" },
        { key: "runtime", en: "Runtime (minutes)", ar: "المدة (دقائق)", type: "number" },
        { key: "cert", en: "Censorship", ar: "التصنيف" },
        { key: "poster_url", en: "Poster URL", ar: "رابط البوستر", type: "url" },
        { key: "director_en", en: "Director (English)", ar: "المخرج (إنجليزي)" },
        { key: "director_ar", en: "Director (Arabic)", ar: "المخرج (عربي)" },
        { key: "synopsis_en", en: "Synopsis (English)", ar: "الملخص (إنجليزي)", type: "textarea" },
        { key: "synopsis_ar", en: "Synopsis (Arabic)", ar: "الملخص (عربي)", type: "textarea" },
      ]}
      cols={[
        {
          key: "title",
          label: L(lang, "Title", "العنوان"),
          value: (m) => m.title_en,
          render: (m) => (
            <div className="flex min-w-48 items-center gap-2">
              <Thumb src={m.poster_url} />
              <span className="font-semibold">{m.title_en}</span>
              {matchesBuiltinMovie(m.title_en) && (
                <DuplicateBadge
                  title="Same title as a built-in movie — the public site shows it once (your entry leads)"
                  label={L(lang, "built-in duplicate", "مكرر مع الكتالوج")}
                />
              )}
            </div>
          ),
        },
        { key: "status", label: L(lang, "Status", "الحالة"), value: (m) => m.status },
        { key: "genre", label: L(lang, "Genre", "النوع"), value: (m) => m.genre },
        {
          key: "release",
          label: L(lang, "Release", "العرض"),
          value: (m) => m.release_date ?? "",
          render: (m) =>
            m.release_date || m.year ? fmtDate(m.release_date ?? `${m.year}-01-01`, lang) : "—",
        },
        {
          key: "rating",
          label: L(lang, "Rating", "التقييم"),
          value: (m) => m.rating ?? 0,
          render: (m) => m.rating ?? "—",
        },
      ]}
    />
  );
}

export function PeopleManager({ lang, data }: { lang: Lang; data: ManagedContent }) {
  const rows = managedPeople(data);
  return (
    <CrudSection<ManagedPersonRow>
      lang={lang}
      table="managed_people"
      rows={rows}
      addLabel={L(lang, "Add person", "إضافة شخص")}
      addTitle={L(lang, "Add person", "إضافة شخص")}
      editTitle={L(lang, "Edit person", "تعديل شخص")}
      blank={{
        name_en: "",
        name_ar: "",
        role_en: "Actor",
        role_ar: "ممثل",
        bio: "",
        photo_url: "",
      }}
      toForm={(r) => ({
        name_en: r.name_en,
        name_ar: r.name_ar,
        role_en: r.role_en,
        role_ar: r.role_ar,
        bio: r.bio,
        photo_url: r.photo_url ?? "",
      })}
      toRow={(f) => {
        const g = (k: string) => f[k] ?? "";
        return {
          name_en: g("name_en").trim(),
          name_ar: g("name_ar").trim(),
          role_en: g("role_en").trim() || "Actor",
          role_ar: g("role_ar").trim() || "ممثل",
          bio: g("bio").trim(),
          photo_url: g("photo_url").trim() || null,
        };
      }}
      fields={[
        { key: "name_en", en: "Name (English)", ar: "الاسم (إنجليزي)" },
        { key: "name_ar", en: "Name (Arabic)", ar: "الاسم (عربي)" },
        { key: "role_en", en: "Role (English)", ar: "الدور (إنجليزي)" },
        { key: "role_ar", en: "Role (Arabic)", ar: "الدور (عربي)" },
        { key: "photo_url", en: "Photo URL", ar: "رابط الصورة", type: "url", full: true },
        { key: "bio", en: "Short bio", ar: "نبذة", type: "textarea" },
      ]}
      cols={[
        {
          key: "name",
          label: L(lang, "Name", "الاسم"),
          value: (p) => p.name_en,
          render: (p) => (
            <div className="flex min-w-40 items-center gap-2">
              <Thumb src={p.photo_url} wide />
              <span className="font-semibold">{p.name_en}</span>
              {matchesBuiltinPerson(p.name_en) && (
                <DuplicateBadge
                  title="Same name as a built-in person — the public site shows it once (your entry leads)"
                  label={L(lang, "built-in duplicate", "مكرر مع الكتالوج")}
                />
              )}
            </div>
          ),
        },
        { key: "role", label: L(lang, "Role", "الدور"), value: (p) => p.role_en },
      ]}
    />
  );
}

export function BoxOfficeManager({ lang, data }: { lang: Lang; data: ManagedContent }) {
  const rows = managedBoxofficeRows(data);
  return (
    <CrudSection<ManagedBoxofficeRow>
      lang={lang}
      table="managed_boxoffice"
      rows={rows}
      addLabel={L(lang, "Add row", "إضافة صف")}
      addTitle={L(lang, "Add box office row", "إضافة صف بالبوكس أوفيس")}
      editTitle={L(lang, "Edit box office row", "تعديل صف البوكس أوفيس")}
      blank={{ title_en: "", title_ar: "", weekly_egp: "", total_egp: "" }}
      toForm={(r) => ({
        title_en: r.title_en,
        title_ar: r.title_ar,
        weekly_egp: String(r.weekly_egp),
        total_egp: String(r.total_egp),
      })}
      toRow={(f) => {
        const g = (k: string) => f[k] ?? "";
        return {
          title_en: g("title_en").trim(),
          title_ar: g("title_ar").trim(),
          weekly_egp: g("weekly_egp") ? Number(g("weekly_egp")) : 0,
          total_egp: g("total_egp") ? Number(g("total_egp")) : 0,
        };
      }}
      fields={[
        { key: "title_en", en: "Movie (English)", ar: "الفيلم (إنجليزي)" },
        { key: "title_ar", en: "Movie (Arabic)", ar: "الفيلم (عربي)" },
        {
          key: "weekly_egp",
          en: "Weekly revenue (EGP)",
          ar: "إيراد الأسبوع (ج.م)",
          type: "number",
        },
        { key: "total_egp", en: "Total revenue (EGP)", ar: "إجمالي الإيراد (ج.م)", type: "number" },
      ]}
      cols={[
        {
          key: "title",
          label: L(lang, "Movie", "الفيلم"),
          value: (r) => r.title_en,
          render: (r) => <span className="font-semibold">{r.title_en}</span>,
        },
        { key: "weekly", label: L(lang, "Weekly", "الأسبوع"), value: (r) => r.weekly_egp },
        { key: "total", label: L(lang, "Total", "الإجمالي"), value: (r) => r.total_egp },
      ]}
    />
  );
}

const CHANNEL_CATS = (lang: Lang) => [
  { value: "general", label: L(lang, "General", "عام") },
  { value: "movies", label: L(lang, "Movies", "أفلام") },
  { value: "series", label: L(lang, "Series", "مسلسلات") },
  { value: "news", label: L(lang, "News", "أخبار") },
  { value: "sports", label: L(lang, "Sports", "رياضة") },
  { value: "kids", label: L(lang, "Kids", "أطفال") },
  { value: "music", label: L(lang, "Music", "موسيقى") },
  { value: "documentary", label: L(lang, "Documentary", "وثائقي") },
  { value: "religion", label: L(lang, "Religion", "ديني") },
];

export function ChannelsManager({ lang, data }: { lang: Lang; data: ManagedContent }) {
  const channels = managedChannels(data);
  const [channelId, setChannelId] = useState<string>("");
  const active = channels.find((c) => c.id === channelId) ?? null;
  return (
    <div className="space-y-10">
      <CrudSection<ManagedChannelRow>
        lang={lang}
        table="managed_channels"
        rows={channels}
        addLabel={L(lang, "Add channel", "إضافة قناة")}
        addTitle={L(lang, "Add channel", "إضافة قناة")}
        editTitle={L(lang, "Edit channel", "تعديل قناة")}
        blank={{ name_en: "", name_ar: "", category: "general", logo_url: "" }}
        toForm={(r) => ({
          name_en: r.name_en,
          name_ar: r.name_ar,
          category: r.category,
          logo_url: r.logo_url ?? "",
        })}
        toRow={(f) => {
          const g = (k: string) => f[k] ?? "";
          return {
            name_en: g("name_en").trim(),
            name_ar: g("name_ar").trim(),
            category: g("category") || "general",
            logo_url: g("logo_url").trim() || null,
          };
        }}
        fields={[
          { key: "name_en", en: "Channel (English)", ar: "القناة (إنجليزي)" },
          { key: "name_ar", en: "Channel (Arabic)", ar: "القناة (عربي)" },
          {
            key: "category",
            en: "Category",
            ar: "الفئة",
            type: "select",
            options: CHANNEL_CATS(lang),
          },
          { key: "logo_url", en: "Logo URL", ar: "رابط الشعار", type: "url", full: true },
        ]}
        cols={[
          {
            key: "name",
            label: L(lang, "Channel", "القناة"),
            value: (c) => c.name_en,
            render: (c) => (
              <div className="flex min-w-40 items-center gap-2">
                <Thumb src={c.logo_url} wide />
                <span className="font-semibold">{c.name_en}</span>
              </div>
            ),
          },
          { key: "cat", label: L(lang, "Category", "الفئة"), value: (c) => c.category },
        ]}
      />

      {channels.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-black">
            {L(lang, "Programs", "البرامج")}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            {/* Full width on a phone: a fixed 16rem trigger plus the buttons
                that follow it leaves nothing to tap on either side. */}
            <Select value={channelId || channels[0]!.id} onValueChange={setChannelId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channels.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {active && (
            <ProgramsManager lang={lang} channel={active} programs={managedPrograms(data)} />
          )}
        </div>
      )}
    </div>
  );
}

function ProgramsManager({
  lang,
  channel,
  programs,
}: {
  lang: Lang;
  channel: ManagedChannelRow;
  programs: ManagedProgramRow[];
}) {
  const rows = programs
    .filter((p) => p.channel_id === channel.id)
    .sort((a, b) => a.start_min - b.start_min);
  return (
    <CrudSection<ManagedProgramRow>
      lang={lang}
      table="managed_programs"
      rows={rows}
      addLabel={L(lang, "Add program", "إضافة برنامج")}
      addTitle={L(lang, "Add program", "إضافة برنامج")}
      editTitle={L(lang, "Edit program", "تعديل برنامج")}
      blank={{
        channel_id: channel.id,
        title_en: "",
        title_ar: "",
        start_min: "20:00",
        end_min: "22:00",
        meta: "",
      }}
      toForm={(r) => ({
        channel_id: r.channel_id,
        title_en: r.title_en,
        title_ar: r.title_ar,
        start_min: minutesToTime(r.start_min),
        end_min: minutesToTime(r.end_min),
        meta: r.meta,
      })}
      toRow={(f) => {
        const g = (k: string) => f[k] ?? "";
        return {
          channel_id: channel.id,
          title_en: g("title_en").trim(),
          title_ar: g("title_ar").trim(),
          start_min: timeToMinutes(g("start_min") || "20:00"),
          end_min: timeToMinutes(g("end_min") || "22:00"),
          meta: g("meta").trim(),
        };
      }}
      fields={[
        { key: "title_en", en: "Program (English)", ar: "البرنامج (إنجليزي)" },
        { key: "title_ar", en: "Program (Arabic)", ar: "البرنامج (عربي)" },
        { key: "start_min", en: "Starts", ar: "يبدأ", type: "time" },
        { key: "end_min", en: "Ends", ar: "ينتهي", type: "time" },
        { key: "meta", en: "Note", ar: "ملاحظة", full: true },
      ]}
      cols={[
        {
          key: "title",
          label: L(lang, "Program", "البرنامج"),
          value: (p) => p.title_en,
          render: (p) => <span className="font-semibold">{p.title_en}</span>,
        },
        {
          key: "start",
          label: L(lang, "Starts", "يبدأ"),
          value: (p) => p.start_min,
          render: (p) => minutesToTime(p.start_min),
        },
        {
          key: "end",
          label: L(lang, "Ends", "ينتهي"),
          value: (p) => p.end_min,
          render: (p) => minutesToTime(p.end_min),
        },
        { key: "meta", label: L(lang, "Note", "ملاحظة"), value: (p) => p.meta },
      ]}
    />
  );
}

export function VideosManager({ lang, data }: { lang: Lang; data: ManagedContent }) {
  const rows = managedVideos(data);
  return (
    <CrudSection<ManagedVideoRow>
      lang={lang}
      table="managed_videos"
      rows={rows}
      addLabel={L(lang, "Add video", "إضافة فيديو")}
      addTitle={L(lang, "Add video", "إضافة فيديو")}
      editTitle={L(lang, "Edit video", "تعديل فيديو")}
      blank={{ title_en: "", title_ar: "", url: "", thumb_url: "", duration: "" }}
      toForm={(r) => ({
        title_en: r.title_en,
        title_ar: r.title_ar,
        url: r.url,
        thumb_url: r.thumb_url ?? "",
        duration: r.duration,
      })}
      toRow={(f) => {
        const g = (k: string) => f[k] ?? "";
        return {
          title_en: g("title_en").trim(),
          title_ar: g("title_ar").trim(),
          url: g("url").trim(),
          thumb_url: g("thumb_url").trim() || null,
          duration: g("duration").trim(),
        };
      }}
      fields={[
        { key: "title_en", en: "Title (English)", ar: "العنوان (إنجليزي)" },
        { key: "title_ar", en: "Title (Arabic)", ar: "العنوان (عربي)" },
        { key: "url", en: "Video URL", ar: "رابط الفيديو", type: "url", full: true },
        {
          key: "thumb_url",
          en: "Thumbnail URL",
          ar: "رابط الصورة المصغرة",
          type: "url",
          full: true,
        },
        { key: "duration", en: "Duration", ar: "المدة" },
      ]}
      cols={[
        {
          key: "title",
          label: L(lang, "Title", "العنوان"),
          value: (v) => v.title_en,
          render: (v) => (
            <div className="flex min-w-48 items-center gap-2">
              <Thumb src={v.thumb_url} wide />
              <span className="font-semibold">{v.title_en}</span>
            </div>
          ),
        },
        { key: "duration", label: L(lang, "Duration", "المدة"), value: (v) => v.duration },
      ]}
    />
  );
}

// ------------------------------------------------------- featured lists editor

export function ListsManager({ lang, data }: { lang: Lang; data: ManagedContent }) {
  const rows = managedLists(data);
  const invalidate = useContentInvalidator();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedListRow | null>(null);
  const [form, setForm] = useState<{
    title_en: string;
    title_ar: string;
    items: ManagedListRow["items"];
  }>({ title_en: "", title_ar: "", items: [] });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title_en: form.title_en.trim(),
        title_ar: form.title_ar.trim(),
        items: form.items.map((it) => ({
          ref: it.ref,
          title_en: it.title_en,
          title_ar: it.title_ar,
        })),
      };
      const { error } = editing
        ? await supabase
            .from("managed_lists")
            .update(payload as never)
            .eq("id", editing.id)
        : await supabase.from("managed_lists").insert(payload as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success(L(lang, "Saved", "تم الحفظ"));
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("managed_lists").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success(L(lang, "Deleted", "تم الحذف"));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const catalogue = allMovies(data);
  const [pick, setPick] = useState("");
  const matches = useMemo(() => {
    const n = pick.trim().toLowerCase();
    if (!n) return [];
    return catalogue
      .filter((m) => `${m.title.en} ${m.title.ar}`.toLowerCase().includes(n))
      .slice(0, 8);
  }, [pick, catalogue]);

  const startEdit = (r: ManagedListRow) => {
    setEditing(r);
    setForm({ title_en: r.title_en, title_ar: r.title_ar, items: r.items ?? [] });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {rows.length} {L(lang, "lists", "قائمة")}
        </span>
        <Button
          className="ms-auto"
          onClick={() => {
            setEditing(null);
            setForm({ title_en: "", title_ar: "", items: [] });
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> {L(lang, "Add list", "إضافة قائمة")}
        </Button>
      </div>

      <DataTable
        lang={lang}
        rows={rows}
        cols={[
          {
            key: "title",
            label: L(lang, "Title", "العنوان"),
            value: (r) => r.title_en,
            render: (r) => <span className="font-semibold">{r.title_en}</span>,
          },
          {
            key: "count",
            label: L(lang, "Movies", "الأفلام"),
            value: (r) => (r.items ?? []).length,
          },
          {
            key: "actions",
            label: "",
            value: () => "",
            render: (r) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => startEdit(r)}
                  aria-label={L(lang, "Edit", "تعديل")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    if (window.confirm(L(lang, "Delete this list?", "حذف هذه القائمة؟")))
                      remove.mutate(r.id);
                  }}
                  aria-label={L(lang, "Delete", "حذف")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) {
            setOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent
          dir={lang === "ar" ? "rtl" : "ltr"}
          className="dialog-scroll border-border bg-card sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              {editing ? L(lang, "Edit list", "تعديل قائمة") : L(lang, "Add list", "إضافة قائمة")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {L(lang, "Title (English)", "العنوان (إنجليزي)")}
              </span>
              <Input
                value={form.title_en}
                onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {L(lang, "Title (Arabic)", "العنوان (عربي)")}
              </span>
              <Input
                value={form.title_ar}
                onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
              />
            </label>

            <div className="grid gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {L(lang, "Movies in this list", "أفلام هذه القائمة")}
              </span>
              <div className="flex flex-wrap gap-2">
                {form.items.map((it, i) => (
                  <span
                    key={`${it.ref}-${i}`}
                    className="flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold"
                  >
                    {/* Capped: an unbounded title makes the chip wider than the
                        dialog and the whole row scrolls sideways to reach the X. */}
                    <span title={it.title_en} className="max-w-40 truncate">
                      {it.title_en}
                    </span>
                    <button
                      type="button"
                      aria-label={L(lang, "remove", "إزالة")}
                      onClick={() =>
                        setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))
                      }
                      /* The icon is 12px; the target around it is 24px and pulls
                         into the chip's own padding so the pill stays the size. */
                      className="-me-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {form.items.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    {L(lang, "No movies yet", "لا أفلام بعد")}
                  </span>
                )}
              </div>
            </div>

            <div className="relative grid gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {L(lang, "Find a movie to add", "ابحث عن فيلم لإضافته")}
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-secondary px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={pick}
                  onChange={(e) => setPick(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm outline-none"
                />
              </div>
              {matches.length > 0 && (
                <div className="grid gap-1 rounded-lg border border-border bg-popover p-2 shadow-lg">
                  {matches.map((m: Movie) => (
                    <button
                      key={m.id}
                      type="button"
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-accent"
                      onClick={() => {
                        setForm((f) =>
                          f.items.some((it) => it.ref === m.id)
                            ? f
                            : {
                                ...f,
                                items: [
                                  ...f.items,
                                  { ref: m.id, title_en: m.title.en, title_ar: m.title.ar },
                                ],
                              },
                        );
                        setPick("");
                      }}
                    >
                      <span className="h-8 w-6 shrink-0 overflow-hidden rounded bg-muted">
                        <PosterArt hue={m.hue} title="" img={m.poster} />
                      </span>
                      <span className="truncate font-semibold">{m.title.en}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              >
                {L(lang, "Cancel", "إلغاء")}
              </Button>
              <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
                {L(lang, "Save", "حفظ")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
