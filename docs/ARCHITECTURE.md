# Architecture

## Stack
Next.js (App Router, TypeScript) + Supabase (Postgres + RLS) + Vercel deploy.

## Build now vs later
- **Now:** capture forms, ledger view, match/clear actions, reconciliation run summary.
- **Later:** CSV import, auto-match rules, login + RLS owner scoping, reminders.

## Key user action flow (capture a collection)
1. Open `/recon/[runId]` ledger.
2. Click **Add Collection** -> form (tenant, amount, date, source, note).
3. Submit -> `lib/data/collections.ts` inserts row, returns new ledger.
4. UI row shows status `pending`, matched = 0.
5. Click **Match** -> compares amount to tenant `expected_monthly`; sets status matched/short/excess.
6. Ledger totals + variance recompute server-side.

## Responsive nav shell
Persistent left sidebar on desktop (Dashboard, Runs, Vendors, Tenants). Collapses to hamburger on mobile. Current section highlighted. Keyboard accessible.

## Layer plan
1. **Data layer first** — schema, seed, `lib/data/*` read/write functions.
2. **App logic** — capture, match, clear, run close in server actions.
3. **Smart features** — auto-match + scoring later in `lib/ai/`.

## Why core runs without AI
Match = compare collection amount to `tenant.expected_monthly`; clear = set payment status + link bank line. Pure SQL + server actions. AI scoring is additive, not required.

## Repo structure
```
app/                    # routes per feature
lib/data/               # all DB reads/writes (single source)
lib/actions/            # server actions (capture, match, clear, close run)
lib/ai/                 # auto-match + scoring (later)
components/             # shared UI
__tests__/              # beside code tested
```

## Module map
| Module | Responsibility | Owns data | Build order |
|---|---|---|---|
| recon-runs | create/close a monthly run | reconciliation_runs | 1 |
| collections | capture + match tenant collections | tenant_collections, tenants | 2 |
| payments | capture + clear vendor payments | vendor_payments, vendors, bank_transactions | 3 |
| ledger | combined view + variance | read across tables | 4 |
| auth (later) | login + owner RLS | user_id scoping | 5 |
| intelligence (later) | auto-match + scoring | bank_transactions confidence | 6 |