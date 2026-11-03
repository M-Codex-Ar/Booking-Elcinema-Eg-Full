import { createServerFn } from "@tanstack/react-start";
import {
  getLineupDetail,
  getLineupIndex,
  getPersonDetail,
  getVideoDetail,
  getVideoGallery,
  getVodGuide,
  getWorkDetail,
} from "./live.server";
import type { Lang } from "./home.shared";
import type {
  LiveLineupDetail,
  LiveLineupIndex,
  LivePerson,
  LiveVideo,
  LiveVideoGallery,
  LiveVodGuide,
  LiveWork,
} from "./live.shared";

const NOT_AVAILABLE_EN =
  "This page couldn't be loaded from the cinema guide right now. Please try again soon.";
const NOT_AVAILABLE_AR = "تعذّر تحميل هذه الصفحة من دليل السينما الآن. يرجى المحاولة بعد قليل.";

function wrap<T>(error: unknown, lang: Lang): { data: T | null; error: string } {
  console.error("live scrape failed", error);
  return { data: null, error: lang === "ar" ? NOT_AVAILABLE_AR : NOT_AVAILABLE_EN };
}

export const getLiveWorkFn = createServerFn({ method: "GET" })
  .validator((input: { lang: Lang; id: string }) => input)
  .handler(async ({ data }) => {
    try {
      return { data: await getWorkDetail(data.lang, data.id), error: null };
    } catch (error) {
      return wrap<LiveWork>(error, data.lang);
    }
  });

export const getLivePersonFn = createServerFn({ method: "GET" })
  .validator((input: { lang: Lang; id: string }) => input)
  .handler(async ({ data }) => {
    try {
      return { data: await getPersonDetail(data.lang, data.id), error: null };
    } catch (error) {
      return wrap<LivePerson>(error, data.lang);
    }
  });

export const getVideoGalleryFn = createServerFn({ method: "GET" })
  .validator((input: { lang: Lang }) => input)
  .handler(async ({ data }) => {
    try {
      return { data: await getVideoGallery(data.lang), error: null };
    } catch (error) {
      return wrap<LiveVideoGallery>(error, data.lang);
    }
  });

export const getVideoDetailFn = createServerFn({ method: "GET" })
  .validator((input: { lang: Lang; id: string }) => input)
  .handler(async ({ data }) => {
    try {
      return { data: await getVideoDetail(data.lang, data.id), error: null };
    } catch (error) {
      return wrap<LiveVideo>(error, data.lang);
    }
  });

export const getVodGuideFn = createServerFn({ method: "GET" })
  .validator((input: { lang: Lang }) => input)
  .handler(async ({ data }) => {
    try {
      return { data: await getVodGuide(data.lang), error: null };
    } catch (error) {
      return wrap<LiveVodGuide>(error, data.lang);
    }
  });

export const getLineupIndexFn = createServerFn({ method: "GET" })
  .validator((input: { lang: Lang }) => input)
  .handler(async ({ data }) => {
    try {
      return { data: await getLineupIndex(data.lang), error: null };
    } catch (error) {
      return wrap<LiveLineupIndex>(error, data.lang);
    }
  });

export const getLineupDetailFn = createServerFn({ method: "GET" })
  .validator((input: { lang: Lang; id: string }) => input)
  .handler(async ({ data }) => {
    try {
      return { data: await getLineupDetail(data.lang, data.id), error: null };
    } catch (error) {
      return wrap<LiveLineupDetail>(error, data.lang);
    }
  });
