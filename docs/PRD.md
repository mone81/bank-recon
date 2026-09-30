# Bank Reconciliation (bank-recon)

## Problem
Monthly bank reconciliation is done on paper document forms. Vendor payments and tenant collections are captured by hand, matched against the bank statement, and cleared. Slow, error-prone, no audit trail.

## Target user
A colleague on the finance/ops team and their boss. Internal tool, single workspace. Replaces a paper document form.

## Core objects
- **Vendor** — payee (name, account_no)
- **Tenant** — source of collections (name, expected_monthly)
- **Vendor Payment** — outbound (vendor, amount, payment_date, reference, status: outstanding/cleared)
- **Tenant Collection** — inbound (tenant, amount, collection_date, source, matched amount, status)
- **Bank Transaction** — statement line (txn_date, amount, direction, description, status)
- **Reconciliation Run** — month being reconciled (period_month, totals, variance, status: open/reconciled/locked)

## MVP (v1) — must-haves
- [ ] Capture a tenant collection into the ledger (persists)
- [ ] Capture a vendor payment into the ledger (persists)
- [ ] View combined general ledger (collections + payments) for a run
- [ ] Match a collection to expected monthly amount; mark matched/short/excess
- [ ] Clear a vendor payment against a bank statement line
- [ ] Create a reconciliation run, see totals + variance, mark reconciled
- [ ] All screens render with seed demo data, no login required

## Non-goals (v1)
- Login / per-user data isolation (later sprint)
- CSV bank-statement import (later)
- Auto-match rules / confidence scoring (later)
- Reminders / email / multi-tenant SaaS

## Success criteria
One concrete end-to-end: a staff member opens the May run, captures three tenant collections and two vendor payments, matches each collection to its expected rent, clears the two outstanding vendor payments against bank lines, sees variance = 0, and marks the run reconciled. Done in under five minutes with no paper form. Works on first load with seed data, no login wall.