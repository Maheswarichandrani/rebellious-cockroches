# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # dev server on :3000
npm run build        # production build
npm run lint         # eslint
npm run typegen      # regenerate sanity.types.ts from deployed schema
```

No test suite configured yet.

## Environment Variables Required

```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
SANITY_API_READ_TOKEN      # for sanityFetch / SanityLive
SANITY_API_TOKEN           # write client (server-only, orders/mutations)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL          # optional, defaults to noreply@cjpbrand.in
ADMIN_EMAIL                # optional, defaults to admin@cjpbrand.in
```

## Architecture

**Stack:** Next.js 16 (App Router) · Sanity v5 (headless CMS) · Clerk (auth) · Zustand (cart state) · Tailwind v4 · shadcn/ui · Resend (email) · Razorpay (payments, wired but not fully integrated)

### Data flow

- All Sanity reads use `sanityFetch` from `sanity/lib/live.ts` (enables live preview/stale revalidation). Plain `client` from `sanity/lib/client.ts` is for one-off lookups only.
- Mutations (e.g. writing orders) go through `writeClient` in `sanity/lib/write.ts` — server-only, requires `SANITY_API_TOKEN`.
- GROQ queries are centralised in `sanity/lib/queries.ts` using `defineQuery`. TypeScript types come from `sanity.types.ts` (auto-generated — do not edit by hand; run `npm run typegen` after schema changes).

### Auth

Clerk wraps the entire app via `ClerkProvider` in `app/layout.tsx`. Only `/account(.*)` is protected (see `middleware.ts`). Guest users get a full cart experience; on sign-in, `CartMergeEffect` merges localStorage cart into the Zustand store.

### Cart

Zustand store in `hooks/use-cart.ts`, persisted to `localStorage` under key `cjp-cart`. Cart items snapshot price/image at add-time so stale Sanity data never silently changes what the user sees. Cart sidebar is rendered globally in `app/layout.tsx`.

### Sanity Studio

Embedded at `/studio` via `app/studio/[[...tool]]/page.tsx`. Schema lives in `sanity/schemaTypes/` — documents (`product`, `category`, `order`) and objects (`colorVariant`, `sizeEntry`, `seoFields`). Products use `colorVariants[]` (color + images + sizes with stock/SKU) as the main variant model.

### Email

`lib/email/resend.ts` exports a singleton `resend` instance (server-only). React Email templates live in `lib/email/templates/`. Contact form API route (`app/api/contact/route.ts`) has in-memory IP rate limiting (3 req / 10 min).

### Route structure

| Path | Purpose |
|---|---|
| `/` | Landing page (hero + featured products) |
| `/shop` | Full product listing |
| `/shop/[id]` | PDP (product detail) |
| `/account` | Protected user account |
| `/contact` | Contact form |
| `/studio` | Embedded Sanity Studio |
