import { createServerFn } from "@tanstack/react-start";
import { getHomePage } from "@/features/home/home.server";

export const getElcinemaHomeFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return { data: await getHomePage(), error: null };
  } catch (error) {
    console.error("getElcinemaHome failed", error);
    return {
      data: null,
      error: "Could not load the cinema guide right now. Please try again soon.",
    };
  }
});
