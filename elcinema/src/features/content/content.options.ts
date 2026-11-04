/** Shared query for the optional managed-content payload (public read). */
import { queryOptions } from "@tanstack/react-query";
import { getManagedContent } from "@/features/content/content.functions";

export const managedContentOptions = queryOptions({
  queryKey: ["managed-content"],
  queryFn: () => getManagedContent(),
  staleTime: 60 * 1000,
});
