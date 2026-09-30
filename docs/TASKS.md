# Tasks

## Sprint 1 — Database + Core Capture
**Goal:** schema live, seed data, data-access layer, repo shape.
- [ ] Run migration_sql; confirm 6 tables + seed rows in Supabase.
- [ ] `lib/data/` with read/write per table.
- [ ] Feature folder structure (recon-runs, collections, payments, ledger).
- [ ] Seed: 3 vendors, 3 tenants, 1 run, 6 bank lines, 3 payments, 3 collections.
**DoD:** Querying any table returns seeded rows; repo builds with no type errors.

## Sprint 2 — Capture Forms + Ledger View
**Goal:** create collections and payments, see them in the ledger.
- [ ] Capture collection form -> persists, status pending.
- [ ] Capture payment form -> persists, status outstanding.
- [ ] Combined ledger page per run (collections + payments).
- [ ] Loading, empty, error, partial states on every screen.
- [ ] Sidebar nav desktop / hamburger mobile.
**DoD:** Submitting either form persists a real row visible in the ledger; refresh keeps it.

## Sprint 3 — Match & Clear + Reconciliation Run (v1 functional milestone)
**Goal:** full success scenario end-to-end, no login.
- [ ] Match collection -> compare amount to tenant.expected_monthly -> status matched/short/excess.
- [ ] Clear vendor payment -> link bank line, status cleared, cleared_at set.
- [ ] Run page: total_credit, total_debit, variance computed server-side.
- [ ] Mark run reconciled (only if variance = 0).
- [ ] Empty/error states for match mismatch and locked run.
**DoD:** Success scenario from PRD runs in preview with seed data + new rows, variance = 0, run reconciled.

## Sprint 4 — Lock It Down
**Goal:** auth + owner RLS, keep public demo landing.
- [ ] Supabase Auth login/signup pages.
- [ ] Replace permissive RLS with `auth.uid() = user_id`.
- [ ] Backfill user_id on existing demo rows.
- [ ] Public landing route still shows seed demo without login.
- [ ] If RLS work is beyond builder: stop, get a human.
**DoD:** Logged-out user sees only demo landing; logged-in sees only own rows; no leakage.

## Gantt
```
S1 ████████ DB + seed
S2         ████████ Forms + ledger
S3                ████████ Match/clear/run  (v1)
S4                        ████████ Auth + RLS
```