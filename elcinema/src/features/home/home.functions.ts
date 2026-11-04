import { createServerFn } from "@tanstack/react-start";
import { HOME_TV_GUIDE_PREVIEW_LIMIT } from "@/features/home/home.constants";
import { getHomePage } from "@/features/home/home.server";

export const getElcinemaHomeFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await getHomePage();
    return {
      data: {
        ...data,
        tvGuide: {
          ...data.tvGuide,
          lines: data.tvGuide.lines.slice(0, HOME_TV_GUIDE_PREVIEW_LIMIT),
        },
      },
      error: null,
    };
  } catch (error) {
    console.error("getElcinemaHome failed", error);
    return {
      data: null,
      error: "Could not load the cinema guide right now. Please try again soon.",
    };
  }
});
