import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { RoutePending } from "@/components/shared/ui";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 15 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Pre-fetch the destination route's loader (and its query cache) on
    // hover/focus — navigations land on cached data instead of waiting for a
    // live scrape. Route-level options can raise staleTime further.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 5 * 60 * 1000,
    // Branded shell + spinner instead of a frozen page when a cold route
    // must wait for its server function.
    defaultPendingMs: 250,
    defaultPendingComponent: RoutePending,
  });

  return router;
};
