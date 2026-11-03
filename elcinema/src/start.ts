import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "@/lib/error-page";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const startConfig = () => ({
  // The attacher reads `supabase.auth.getSession()` on the *caller* side, so it
  // runs for every server function — including during SSR. With no publishable
  // env inlined the generated client throws, which turned every public page into
  // a 500 even though `getManagedContent` degrades to empty lists. Skipping the
  // middleware when the client cannot be built keeps the static catalogue up;
  // the dashboard is unreachable anyway because `_authenticated` redirects.
  functionMiddleware: isSupabaseConfigured() ? [attachSupabaseAuth] : [],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
});

export const startInstance = createStart(startConfig);
