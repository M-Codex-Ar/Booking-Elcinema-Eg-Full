/**
 * The single source of truth for UI copy.
 *
 * Every string the interface renders lives here, keyed by `area.thing`, so a
 * translation pass touches one file and a missing key is a compile error rather
 * than an English string leaking into the Arabic edition. Domain data (movie
 * titles, genre names) keeps travelling as `Bi` values and is rendered with
 * `bi()`; only chrome/labels/copy belong in `COPY`.
 *
 * Usage:
 *   const t = makeT(lang);
 *   t("home.boxOffice")
 *   t("search.results", { count: 12 })
 */
import type { Bi, Lang } from "./home.shared";

/** Render a bilingual domain value. */
export const bi = (value: Bi | undefined, lang: Lang): string => (value ? value[lang] : "");

/**
 * Ad-hoc bilingual pair for data-driven labels that are defined next to the
 * field they describe (dashboard field specs). Prefer a `COPY` key when the
 * string is chrome rather than schema.
 */
export const pair = (lang: Lang, en: string, ar: string): string => (lang === "ar" ? ar : en);

export const COPY = {
  /* ---- Site chrome ---------------------------------------------------- */
  "chrome.login": { en: "login", ar: "تسجيل الدخول" },
  "chrome.signOut": { en: "Sign out", ar: "خروج" },
  "chrome.search": { en: "Search", ar: "ابحث" },
  "chrome.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "chrome.switchTo": { en: "عربي", ar: "English" },
  "chrome.menu": { en: "Menu", ar: "القائمة" },
  "chrome.sections": { en: "Sections", ar: "أقسام" },
  "chrome.advancedSearch": { en: "Search the catalogue", ar: "بحث متقدم" },
  "chrome.copyright": {
    en: "Copyright © Damlag S.A.E — sample replica for demo purposes",
    ar: "جميع الحقوق محفوظة © دملاج س.أ.م — نسخة تجريبية للعرض فقط",
  },
  "chrome.chairman": { en: "Chairman: Khaled Hesham", ar: "رئيس مجلس الإدارة: خالد هشام" },
  "chrome.editor": { en: "Editor-in-Chief: Doaa Mohamed", ar: "مدير التحرير: ضياء محمد" },
  "chrome.skipToContent": { en: "Skip to content", ar: "الانتقال إلى المحتوى" },

  /* ---- Navigation ----------------------------------------------------- */
  "nav.cinema": { en: "Cinema", ar: "السينما" },
  "nav.watch": { en: "Watch", ar: "شاهد" },
  "nav.now": { en: "Now Playing", ar: "السينمات الآن" },
  "nav.soon": { en: "Coming Soon", ar: "قريباً" },
  "nav.booking": { en: "Book tickets", ar: "احجز تذاكر" },
  "nav.boxoffice": { en: "Box Office", ar: "بوكس أوفيس" },
  "nav.boxofficeFooter": { en: "Cinema Revenue", ar: "إيرادات السينما" },
  "nav.tvguide": { en: "TV Guide", ar: "جدول القنوات" },
  "nav.vod": { en: "Watch Online", ar: "شاهد أونلاين" },
  "nav.video": { en: "elCinema TV", ar: "إل سينما TV" },
  "nav.lineup": { en: "Featured Lists", ar: "قوائم مختارة" },
  "nav.search": { en: "Search", ar: "بحث" },
  "nav.boxofficeWeekly": { en: "Weekly Box Office", ar: "بوكس أوفيس الأسبوعي" },
  "nav.tonight": { en: "Tonight on TV", ar: "الليلة على التلفاز" },

  /* ---- Home rails ----------------------------------------------------- */
  "home.nowInCinemas": { en: "Now in Cinemas", ar: "في السينمات الآن" },
  "home.watchOnline": { en: "Watch Online", ar: "شاهد أونلاين" },
  "home.onTvNow": { en: "On TV Now", ar: "على التلفاز الآن" },
  "home.tvGuide": { en: "TV Guide", ar: "جدول القنوات" },
  "home.videos": { en: "Videos", ar: "فيديوهات" },
  "home.boxOffice": { en: "Box Office", ar: "بوكس أوفيس" },
  "home.lists": { en: "Lists", ar: "قوائم" },
  "home.seeAll": { en: "See all", ar: "عرض الكل" },
  "home.moreInfo": { en: "More info", ar: "المزيد" },
  "home.bookTickets": { en: "Book tickets", ar: "احجز تذاكر" },
  "home.slide": { en: "Slide {n}", ar: "الشريحة {n}" },
  "home.previous": { en: "Previous", ar: "السابق" },
  "home.next": { en: "Next", ar: "التالي" },
  "home.replay": { en: "Pause carousel", ar: "إيقاف العرض مؤقتًا" },
  "home.play": { en: "Play carousel", ar: "تشغيل العرض" },

  /* ---- List controls -------------------------------------------------- */
  "controls.sort": { en: "Sort", ar: "ترتيب" },
  "controls.gridView": { en: "Grid view", ar: "شبكة" },
  "controls.listView": { en: "List view", ar: "قائمة" },
  "controls.previous": { en: "Previous", ar: "السابق" },
  "controls.next": { en: "Next", ar: "التالي" },
  "controls.page": { en: "Page", ar: "صفحة" },
  "controls.filter": { en: "Filter…", ar: "فلترة…" },
  "controls.all": { en: "All", ar: "الكل" },
  "controls.az": { en: "A to Z", ar: "أبجديًا" },
  "controls.za": { en: "Z to A", ar: "عكسي" },
  "controls.default": { en: "Default", ar: "الافتراضي" },
  "controls.none": { en: "No matches.", ar: "لا نتائج." },

  /* ---- Shared labels -------------------------------------------------- */
  "common.director": { en: "Director", ar: "المخرج" },
  "common.directorColon": { en: "Director:", ar: "المخرج:" },
  "common.writerColon": { en: "Writer:", ar: "الكاتب:" },
  "common.cast": { en: "Cast", ar: "طاقم التمثيل" },
  "common.castColon": { en: "Cast:", ar: "طاقم التمثيل:" },
  "common.runtimeMin": { en: "min", ar: "دقيقة" },
  "common.runtimeMinutes": { en: "minutes", ar: "دقيقة" },
  "common.languageColon": { en: "Language:", ar: "اللغة:" },
  "common.story": { en: "Story", ar: "القصة" },
  "common.photos": { en: "Photos", ar: "صور" },
  "common.videos": { en: "elCinema TV", ar: "إل سينما TV" },
  "common.watchOnline": { en: "Watch Online", ar: "شاهد أونلاين" },
  "common.watchOn": { en: "Watch on", ar: "شاهد على" },
  "common.userScore": { en: "User score", ar: "تقييم المستخدمين" },
  "common.released": { en: "Released", ar: "تم العرض" },
  "common.tickets": { en: "tickets", ar: "تذاكر" },
  "common.bookTickets": { en: "Book tickets", ar: "احجز تذاكر" },
  "common.showtimes": { en: "Playing in Egypt Cinemas", ar: "معروض في سينمات مصر" },
  "common.playbackNote": {
    en: "Opens the real play link in a new tab.",
    ar: "يفتح رابط المشاهدة الحقيقي في نافذة جديدة.",
  },
  "common.ticketNote": {
    en: "Opens the real ticket service in a new tab.",
    ar: "يفتح خدمة التذاكر الحقيقية في نافذة جديدة.",
  },
  "common.notFoundMovie": { en: "Movie not found", ar: "الفيلم غير موجود" },
  "common.notFoundPerson": { en: "Person not found", ar: "الشخص غير موجود" },
  "common.goHome": { en: "Go home", ar: "الصفحة الرئيسية" },
  "common.couldntLoad": { en: "Couldn't load this page", ar: "تعذّر التحميل" },
  "common.noPoster": { en: "No poster", ar: "لا بوستر" },
  "common.releaseDateColon": { en: "Release Date:", ar: "تاريخ العرض:" },
  "common.release": { en: "Releases", ar: "يُعرض" },
  "common.knownFor": { en: "Known for", ar: "معروف بـ" },
  "common.filmography": { en: "Filmography", ar: "الأعمال" },
  "common.works": { en: "works", ar: "عمل" },
  "common.nationalityColon": { en: "Nationality:", ar: "الجنسية:" },
  "common.crew": { en: "Crew worked with", ar: "عمل مع" },
  "common.role": { en: "Role", ar: "الدور" },
  "common.similar": { en: "More like this", ar: "أفلام مشابهة" },
  "common.awards": { en: "Awards & Nominations", ar: "الجوائز والترشيحات" },
  "common.won": { en: "Won", ar: "فاز" },
  "common.nominated": { en: "Nominated", ar: "رُشّح" },
  "common.relatedNow": { en: "Now Playing In Egypt Cinemas", ar: "معروض الآن في سينمات مصر" },
  "common.newTab": { en: "Opens in a new tab", ar: "يفتح في نافذة جديدة" },

  /* ---- Now Playing / Coming Soon -------------------------------------- */
  "now.title": { en: "Now Playing", ar: "السينمات الآن" },
  "now.sub": {
    en: "Movies in Egyptian cinemas this week",
    ar: "أفلام في السينمات المصرية هذا الأسبوع",
  },
  "now.sortFeatured": { en: "Featured", ar: "المميز" },
  "now.sortRating": { en: "Top rated", ar: "الأعلى تقييمًا" },
  "now.sortNewest": { en: "Newest", ar: "الأحدث" },
  "soon.title": { en: "Coming Soon", ar: "قريباً" },
  "soon.sub": {
    en: "Upcoming releases in Egyptian cinemas",
    ar: "أفلام قادمة إلى السينمات المصرية",
  },
  "soon.sortSoonest": { en: "Soonest", ar: "الأقرب عرضًا" },
  "soon.sortLongest": { en: "Longest", ar: "الأطول" },
  "soon.unrated": { en: "Not rated yet", ar: "لم يُقيَّم بعد" },
  "soon.addedBy": { en: "Added by the elCinema editors", ar: "أضافه محررو إل سينما" },

  /* ---- Box office ------------------------------------------------------ */
  "box.title": { en: "Cinema Revenue", ar: "إيرادات السينما" },
  "box.sub": { en: "Weekly Egypt box office, top 20", ar: "بوكس أوفيس مصر الأسبوعي، أفضل 20" },
  "box.rank": { en: "#", ar: "#" },
  "box.movie": { en: "Movie", ar: "الفيلم" },
  "box.weekly": { en: "Weekly revenue", ar: "إيراد الأسبوع" },
  "box.total": { en: "Total revenue", ar: "إجمالي الإيراد" },

  /* ---- Booking --------------------------------------------------------- */
  "booking.title": { en: "Book tickets", ar: "احجز تذاكر" },
  "booking.subtitle": {
    en: "Pick a movie to see its cinemas and showtimes",
    ar: "اختر فيلمًا لعرض سينماته ومواعيده",
  },
  "booking.cinemas": { en: "Cinemas & showtimes", ar: "السينمات ومواعيد العرض" },
  "booking.back": { en: "All movies", ar: "كل الأفلام" },
  "booking.sampleNote": {
    en: "Sample catalogue — showtimes generated for the demo.",
    ar: "بيانات العرض التجريبية — المواعيد مولّدة للعرض فقط.",
  },
  "booking.noTimes": {
    en: "No showtimes published for this day.",
    ar: "لا توجد مواعيد معلنة لهذا اليوم.",
  },

  /* ---- TV guide -------------------------------------------------------- */
  "guide.title": { en: "TV Guide", ar: "جدول القنوات" },
  "guide.sub": {
    en: "Tonight across Arab satellite channels",
    ar: "الليلة على القنوات الفضائية العربية",
  },
  "guide.channels": { en: "channels", ar: "قناة" },
  "guide.filterChannels": { en: "Filter channels…", ar: "ابحث في القنوات…" },
  "guide.noChannels": { en: "No channels match this filter.", ar: "لا قنوات مطابقة لهذا الفلتر." },

  /* ---- Videos / VOD / Lists -------------------------------------------- */
  "video.gallery": { en: "elCinema TV — Video Gallery", ar: "إل سينما TV — معرض الفيديو" },
  "video.latest": { en: "Latest videos", ar: "أحدث الفيديوهات" },
  "video.related": { en: "More videos", ar: "مزيد من الفيديوهات" },
  "video.play": { en: "Play", ar: "تشغيل" },
  "vod.title": { en: "Watch Online", ar: "شاهد أونلاين" },
  "vod.subtitle": {
    en: "Where to stream movies and series right now",
    ar: "أين تشاهد الأفلام والمسلسلات الآن",
  },
  "vod.platforms": { en: "Streaming platforms", ar: "منصات المشاهدة" },
  "vod.onDemand": { en: "Movies & series available online", ar: "أفلام ومسلسلات متاحة أونلاين" },
  "vod.cats": { en: "Categories", ar: "التصنيفات" },
  "lineup.title": { en: "Featured Lists", ar: "قوائم مختارة" },
  "lineup.subtitle": {
    en: "Curated movies & series by the elCinema editors",
    ar: "أفلام ومسلسلات مختارة من محرري إل سينما",
  },
  "lineup.back": { en: "All lists", ar: "كل القوائم" },
  "lineup.empty": { en: "This list is empty.", ar: "هذه القائمة فارغة." },

  /* ---- Search ---------------------------------------------------------- */
  "search.title": { en: "Search", ar: "بحث" },
  "search.placeholder": {
    en: "Search movies, people, channels…",
    ar: "ابحث في الأفلام والأشخاص والقنوات…",
  },
  "search.tabAll": { en: "All", ar: "الكل" },
  "search.tabMovie": { en: "Titles", ar: "الأعمال" },
  "search.tabPerson": { en: "Persons", ar: "الأشخاص" },
  "search.tabChannel": { en: "Channels", ar: "القنوات" },
  "search.empty": {
    en: "Type something to search the full elCinema catalogue.",
    ar: "اكتب كلمة للبحث في كامل كتالوج elCinema.",
  },
  "search.noneFor": { en: "No results for {q}", ar: "لا نتائج عن {q}" },
  "search.in": { en: "in", ar: "في" },
  "search.results": { en: "{count} results", ar: "{count} نتيجة" },

  /* ---- Auth ------------------------------------------------------------ */
  "auth.login": { en: "Login", ar: "دخول" },
  "auth.register": { en: "Register", ar: "تسجيل" },
  "auth.welcome": { en: "Welcome back", ar: "مرحبًا بعودتك" },
  "auth.join": { en: "Join elCinema", ar: "انضم إلى إل سينما" },
  "auth.sub": {
    en: "Rate movies, build watchlists and follow your favourite stars.",
    ar: "قيّم الأفلام وأنشئ قوائم المشاهدة وتابع نجومك المفضلين.",
  },
  "auth.name": { en: "Full name", ar: "الاسم بالكامل" },
  "auth.email": { en: "Email", ar: "البريد الإلكتروني" },
  "auth.password": { en: "Password", ar: "كلمة المرور" },
  "auth.confirm": { en: "Confirm password", ar: "تأكيد كلمة المرور" },
  "auth.forgot": { en: "Forgot password?", ar: "نسيت كلمة المرور؟" },
  "auth.noAcc": { en: "No account yet?", ar: "ليس لديك حساب؟" },
  "auth.haveAcc": { en: "Already a member?", ar: "لديك حساب بالفعل؟" },
  "auth.mismatch": { en: "Passwords don't match.", ar: "كلمتا المرور غير متطابقتين." },
  "auth.short": {
    en: "Password must be at least 8 characters.",
    ar: "كلمة المرور 8 أحرف على الأقل.",
  },
  "auth.notEnabled": {
    en: "Accounts aren't switched on yet — your details were not saved.",
    ar: "الحسابات غير مفعّلة بعد — لم يتم حفظ بياناتك.",
  },
  "auth.showPassword": { en: "Show password", ar: "إظهار كلمة المرور" },
  "auth.hidePassword": { en: "Hide password", ar: "إخفاء كلمة المرور" },
  "auth.resetPassword": { en: "Reset password", ar: "استعادة كلمة المرور" },

  /* ---- Theme ----------------------------------------------------------- */
  "theme.toLight": { en: "Switch to light mode", ar: "الوضع الفاتح" },
  "theme.toDark": { en: "Switch to dark mode", ar: "الوضع الداكن" },
} as const satisfies Record<string, Bi>;

export type CopyKey = keyof typeof COPY;

/** Interpolate `{name}` placeholders in a rendered string. */
function interpolate(value: string, vars?: Record<string, string | number>): string {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Look up one key for one language. */
export function text(lang: Lang, key: CopyKey, vars?: Record<string, string | number>): string {
  return interpolate(COPY[key][lang], vars);
}

/** Bound lookup for a component render: `const t = makeT(lang)`. */
export function makeT(lang: Lang) {
  return (key: CopyKey, vars?: Record<string, string | number>) => text(lang, key, vars);
}

/** `lang === "ar"` in one place, so direction rules are not re-derived. */
export const isRtl = (lang: Lang): boolean => lang === "ar";
export const dir = (lang: Lang): "rtl" | "ltr" => (lang === "ar" ? "rtl" : "ltr");
export const otherLang = (lang: Lang): Lang => (lang === "ar" ? "en" : "ar");
