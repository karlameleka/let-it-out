# Let It Out — Web App

A self-exploration journey. Psychologist-led mental health service (est. 2021) offering
online counseling, guided journals (physical + ebook), corporate/community wellbeing
workshops, and an in-app daily journaling experience.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — brand theme in `src/app/globals.css` (`brand`, `sand`, `accent` palettes built around `#1e5b73`)
- **PostgreSQL + Prisma 7** (driver adapter: `@prisma/adapter-pg`)
- **Custom auth** — email/password, bcrypt hashing, signed JWT session cookie (`jose`)
- **Payments** — InstaPay link + manual reference confirmation (no payment API integration; see below)

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Have a PostgreSQL server running and set `DATABASE_URL` in `.env` (see `.env` for the
   local dev value already configured against a local Postgres instance).
3. Run migrations and seed data:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

### Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | Signing secret for auth session cookies — **generate a new random value for production** |
| `INSTAPAY_LINK` | InstaPay payment link shown at checkout |
| `INSTAPAY_HANDLE` | InstaPay handle shown at checkout |

### Dev admin login

Seeding creates an admin account for managing orders/bookings/inquiries:

- Email: `admin@letitout.app`
- Password: `letitout-admin-dev`

**Change or remove this before going to production.**

## App structure

- `/` , `/about`, `/contact` — marketing pages
- `/counseling`, `/counseling/[slug]` — counselor profiles + session booking request form
- `/workshops` — corporate/community workshop topics + quote request form
- `/shop`, `/shop/[slug]`, `/cart`, `/checkout`, `/orders/[id]` — guided journal store
- `/journal`, `/journal/history`, `/journal/[id]` — logged-in daily journaling app
- `/login`, `/signup` — auth
- `/admin` — role-gated dashboard to confirm InstaPay orders and manage booking/workshop/contact submissions

## Payment flow (InstaPay)

There is no InstaPay checkout API, so payment is a manual-confirm flow:

1. Customer checks out → an `Order` is created with status `PENDING_PAYMENT`.
2. The order confirmation page shows the InstaPay link/handle and the amount to send.
3. Customer sends payment via InstaPay, then submits their transaction reference on the
   order page → status moves to `PAYMENT_SUBMITTED`.
4. An admin verifies the payment landed in the InstaPay account and updates the order
   status to `CONFIRMED` (then `SHIPPED`/`COMPLETED`) from `/admin/orders`.

The same manual pattern applies to counseling bookings and workshop inquiries — they're
captured as requests that an admin confirms and follows up on directly (no automatic
scheduling/payment yet).

## Known placeholders — needs your input before launch

- **Ebook prices**: only physical prices were provided (80 Days of Self-Love: 1000 EGP,
  30 Days of Mindfulness: 800 EGP). Ebook prices in `prisma/seed.ts` are a placeholder
  (30% off physical) — update them once real pricing is set, then re-run `npm run db:seed`.
- **Journal cover photos**: product pages currently use a generated brand-colored cover
  (icon + day count) since real cover photos haven't been sent yet. Swap in real photos
  by updating `src/components/product-cover.tsx` / adding images to `Product.coverImageUrl`.
- **Contact details**: the contact page doesn't list a phone/email/address since none was
  provided — add real contact details to `src/app/contact/page.tsx` when available.

## Scripts

- `npm run db:studio` — Prisma Studio (browse/edit DB data)
- `npm run e2e` — Playwright smoke test covering signup → journal entry, shop → checkout →
  InstaPay reference, counseling booking, workshop inquiry, contact form, and admin review
  (requires the dev server running on `localhost:3000`)
- `scripts/process_logo.py` — regenerates the transparent-background logo PNGs in
  `public/brand/` from the source logo PDF, if it ever needs to be redone
