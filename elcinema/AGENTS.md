<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Architecture rules

- Public pages never query the `managed_*` tables directly: all merging of dashboard-managed content with the built-in static catalogue goes through the helpers in `src/features/content/content.ts` (one why: keeps merge order/fallbacks in one testable place).
- Managed rows are read publicly by `getManagedContent` (publishable client, anon SELECT) and written only through `saveManagedRow`/`deleteManagedRow` (`requireSupabaseAuth`, RLS as the user); never use the admin client for these.
- Managed rows get public refs prefixed `m-` (`managedRef`) so `/work/:id` and `/person/:id` resolve both built-in and managed entries with one route.
- The dashboard lives under `src/routes/_authenticated/` and sign-up is disabled: staff accounts are provisioned by the site administrator, never by public registration.
- On the Now Playing page, managed "now" entries render before the built-in list so operators immediately see their additions.
- Public content has no runtime scraper or upstream HTML dependency. Use the bundled catalogue and `managed_*` rows only; reject retired-source media URLs and keep public navigation inside local routes.
