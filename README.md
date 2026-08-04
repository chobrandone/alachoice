# American Liaison in Africa (ALA) — Website

A fully dynamic, database-driven replacement for [alachoice.com](https://alachoice.com). Every piece of front-end content is created, edited, and deleted from a custom admin panel (full CRUD) — **no hard-coded copy, images, or lists in the front end**. Bilingual EN/FR throughout.

---

## Stack

| Layer      | Technology |
|------------|------------|
| Front end  | React 18 + Vite + TypeScript, React Router v6, Tailwind CSS, Framer Motion, TanStack Query, react-i18next |
| API        | Node.js + Express (TypeScript), layered routes → controllers → services → repositories |
| Database   | Supabase (PostgreSQL) with Row Level Security |
| Auth       | Supabase Auth (email/password) for admins, JWT verified server-side |
| Storage    | Supabase Storage buckets: `media`, `logos`, `events`, `documents` |
| Validation | Zod (shared client + server via `@ala/types`) |
| Email      | Nodemailer (SMTP) for inquiry/quote notifications |

The React app **never** writes to Supabase directly — all writes go through the Express API, which holds the service-role key server-side only.

---

## Monorepo layout

```
apps/
  web/        React + Vite front end (public site + /admin panel)
  api/        Express + TypeScript API
packages/
  types/      Shared Zod schemas + TypeScript types (@ala/types)
supabase/
  migrations/ SQL schema (0001) + RLS policies (0002)
  seed/       seed.ts (content), create-admin.ts (first admin)
```

npm workspaces link the packages. `@ala/types` must be built before the api/web typecheck.

---

## Prerequisites

- **Node.js ≥ 20**
- A **Supabase project** (cloud or local). You need its URL, anon key, and service-role key.

---

## Setup

### 1. Install

```bash
npm install
npm run -w @ala/types build      # build shared types first
```

### 2. Create the database schema

Apply the two migrations to your Supabase project, in order. Either paste them
into the Supabase **SQL Editor**, or use the Supabase CLI / psql:

```bash
# via psql (connection string from Supabase → Project Settings → Database)
psql "$DATABASE_URL" -f supabase/migrations/0001_schema.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_rls.sql
```

`0001` creates the schema; `0002` enables RLS (public reads only where
`is_published = true`; all writes restricted to the service role).

### 3. Create the Storage buckets

In the Supabase dashboard → **Storage**, create four buckets (public read):

`media` · `logos` · `events` · `documents`

### 4. Configure environment variables

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Fill in `apps/backend/.env` with your Supabase URL + keys (see the reference below).

### 5. Seed the content

Populates the site with the real bilingual ALA content scraped from the live
alachoice.com (hero, about, 5 services, methodology, FAQs, ATA, events, contact).

```bash
npm run -w @ala/backend seed
```

Idempotent — safe to re-run; it resets content tables to this baseline and never
touches submissions, media, users, or audit logs.

### 6. Create the first admin

The Users module requires an existing super-admin, so bootstrap one:

```bash
npm run -w @ala/backend create-admin -- "you@example.com" "StrongPass123" "Your Name"
```

---

## Running in development

```bash
npm run dev:api      # Express API on http://localhost:4000
npm run dev:web      # Vite dev server on http://localhost:5173
```

- Public site: <http://localhost:5173>
- Admin panel: <http://localhost:5173/admin> (sign in with the admin above)

---

## Testing & type-checking

```bash
npm run -w @ala/backend test     # Supertest API tests (health, sitemap, validation)
npm run -w @ala/frontend test     # Vitest + RTL component/unit tests
npm run typecheck            # type-check all workspaces
```

---

## Building for production

```bash
npm run build     # builds @ala/types, then the API, then the web bundle
```

---

## Deployment

| Piece      | Target             | Notes |
|------------|--------------------|-------|
| Database   | Supabase cloud     | Apply migrations, create buckets, set RLS (steps 2–3 above). |
| API        | Railway / Render   | Root `apps/backend`. Build `npm run build`, start `npm start`. Set all `apps/backend/.env` vars in the host. Point `CORS_ORIGINS` + `SITE_URL` at the deployed front-end URL. |
| Front end  | Vercel             | Root `apps/frontend`. Set `VITE_API_URL` to the deployed API URL (incl. `/api/v1`). |

**Sitemap & robots:** `robots.txt` is served by the front end and points to
`/sitemap.xml`. The sitemap is generated dynamically by the API
(`GET {API_HOST}/sitemap.xml`) from published content. In production, add a
Vercel rewrite so `/sitemap.xml` on the front-end domain proxies to the API, or
submit the API sitemap URL directly in Google Search Console.

---

## Environment variables

### API (`apps/backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | – | API port (default `4000`). |
| `NODE_ENV` | – | `development` \| `production` \| `test`. |
| `CORS_ORIGINS` | ✓ (prod) | Comma-separated allowed front-end origins. |
| `SITE_URL` | ✓ (prod) | Public front-end base URL — used for sitemap `<loc>` entries. |
| `SUPABASE_URL` | ✓ | Supabase project URL. |
| `SUPABASE_ANON_KEY` | ✓ | Anon key (public reads under RLS / JWT verification). |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | Service-role key. **Server-side only** — never expose. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | – | SMTP for notifications. Omit to disable email. |
| `MAIL_FROM` | – | From address for notifications. |
| `MAIL_NOTIFY_TO` | – | Where inquiry/quote notifications are delivered. |
| `PUBLIC_RATE_WINDOW_MS` / `PUBLIC_RATE_MAX` | – | Rate limit for public POSTs. |

### Web (`apps/frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✓ | Base URL of the API, including `/api/v1`. |

---

## Admin panel

`/admin` is a protected React route tree (Supabase Auth + role guard). Modules:

- **Content:** Hero Slides, Pages, Services, Events (with gallery), Team, Partners, Statistics, Methodology, Timeline, FAQs — full CRUD with search, reorder, publish toggles, rich-text (TipTap), and image uploads.
- **Submissions:** Inquiries, Quote Requests, Newsletter — status changes + CSV export.
- **System:** Media Library, Site Settings, Users (super-admin only), Audit Log.

Every change is reflected on the public front end immediately (TanStack Query invalidation).

---

## Content-source notes

The seeded content mirrors the live alachoice.com with these deliberate deviations
(documented in `supabase/seed/data.ts`):

- **Statistics** — the live site shows `0` for all counters; sensible editable defaults are seeded instead.
- **Team** — the live site uses a "John Doe" placeholder; a single editable placeholder member is seeded.
- **Events** — the two real events were dated `2026-03-31` (already past); placeholder future dates are seeded so the Upcoming / Featured sections render. Update them in the admin.
