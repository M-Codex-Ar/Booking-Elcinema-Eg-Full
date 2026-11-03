/** Detail pages for dashboard-managed movies and people. */
import { ArrowLeft, CalendarDays, Clapperboard, Star, UserRound, Users } from "lucide-react";
import { ImgWithFallback } from "@/components/shared/primitives";
import { GENRES } from "@/lib/data";
import { fmtDate, Na, PosterArt, t } from "@/components/shared/ui";
import type { Lang, Movie, Person } from "@/types/home";
import { makeT } from "@/i18n";

/** Managed movie detail: catalogue-style card without showtimes/VOD. */
export function ManagedWorkPage({ movie, lang }: { movie: Movie; lang: Lang }) {
  const copy = makeT(lang);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Na
        href={`/${lang}/now`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {copy("managed.back")}
      </Na>

      <div className="cinema-gradient mt-4 grid gap-6 rounded-2xl border border-border p-4 sm:p-6 md:grid-cols-[220px_1fr]">
        <div className="mx-auto w-44 overflow-hidden rounded-xl bg-secondary md:mx-0 md:w-full">
          <div className="aspect-[2/3]">
            <PosterArt hue={movie.hue} title={movie.title[lang]} img={movie.poster} large />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-black md:text-3xl">{movie.title[lang]}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
              <CalendarDays className="h-3.5 w-3.5 text-primary" /> {fmtDate(movie.release, lang)}
            </span>
            {movie.rating != null && (
              <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {movie.rating.toFixed(1)}
              </span>
            )}
            {movie.runtime > 0 && (
              <span className="rounded-md bg-secondary px-2 py-1">
                {movie.runtime} {copy("common.runtimeMin")}
              </span>
            )}
            {movie.cert && <span className="rounded-md bg-secondary px-2 py-1">{movie.cert}</span>}
          </div>

          {movie.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                >
                  {t(GENRES[g], lang)}
                </span>
              ))}
            </div>
          )}

          {movie.director.en && (
            <p className="mt-4 flex items-center gap-2 text-sm">
              <Clapperboard className="h-4 w-4 text-primary" />{" "}
              <span className="text-muted-foreground">{copy("common.director")}:</span>
              <span className="font-bold">{movie.director[lang]}</span>
            </p>
          )}

          {movie.synopsis.en && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {movie.synopsis[lang]}
            </p>
          )}

          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" /> {copy("common.addedBy")}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Managed person detail: photo, role and a short bio. */
export function ManagedPersonPage({
  person,
  bio,
  lang,
}: {
  person: Person;
  bio?: string | undefined;
  lang: Lang;
}) {
  const copy = makeT(lang);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Na
        href={`/${lang}`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {copy("common.backHome")}
      </Na>

      <div className="cinema-gradient mt-4 flex flex-col items-center gap-6 rounded-2xl border border-border p-6 text-center sm:flex-row sm:text-start">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full bg-secondary">
          <ImgWithFallback
            src={person.photo}
            alt={person.name[lang]}
            className="h-full w-full"
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <UserRound className="h-12 w-12 text-muted-foreground" />
              </div>
            }
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-black md:text-3xl">{person.name[lang]}</h1>
          <p className="mt-1 text-sm font-semibold text-primary">{person.role[lang]}</p>
          {bio && (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
