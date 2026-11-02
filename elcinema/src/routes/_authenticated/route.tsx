import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { isAdmin } from "@/elcinema/auth";

/**
 * Protected layout for the staff dashboard. Client-only (the session lives
 * in browser storage): unauthenticated visitors are redirected to /auth
 * with the blocked URL preserved. Non-admin users are redirected to the home page.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Reading `supabase` without the build-time env throws; send the visitor to
    // the sign-in page, which explains that accounts are not switched on.
    if (!isSupabaseConfigured()) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    if (!isAdmin(data.user)) {
      const match = location.pathname.match(/^\/(en|ar)(\/|$)/);
      const lang = match ? match[1] : "en";
      throw redirect({ to: `/${lang}` as never });
    }
  },
  component: () => <Outlet />,
});
