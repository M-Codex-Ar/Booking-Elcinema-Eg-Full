# ADR 0006 — Serve public content from local catalogue and managed rows

- **Status:** Accepted
- **Date:** 2026-11-05
- **Supersedes:** [ADR 0003](0003-scraped-content-is-read-through-server-functions.md)

## Context

Public requests previously depended on parsing upstream HTML for pages and
details. This introduced long and variable response times, made page rendering
dependent on another site's markup, and allowed external artwork and booking
links into the browser.

## Decision

Public pages use only the committed JSON catalogue and Supabase `managed_*`
content, combined by `features/content/content.ts`. Scraper modules, parser
fixtures, and their HTML parsing dependency are removed. Source-host artwork and
booking URLs are removed from the bundled catalogue, and managed media URL
validation rejects that host. Missing local details render a local not-found
state instead of triggering a network fetch.

## Consequences

- Public page rendering no longer depends on upstream availability or HTML.
- The committed catalogue remains available when Supabase is slow or offline.
- New public content must be added to the catalogue or managed tables through
  the established review/operator flows.
- The previous parser ADR remains as historical context and is not current
  implementation guidance.
