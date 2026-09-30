# Data Model

## vendors
- id (uuid, pk) · user_id (uuid, nullable) · name (text) · account_no (text) · created_at
- RLS: v1 permissive; later `auth.uid() = user_id`.

## tenants
- id · user_id · name · expected_monthly (numeric) · created_at
- RLS: v1 permissive; later owner-scoped.

## bank_transactions
- id · user_id · run_id (fk reconciliation_runs) · txn_date (date) · amount (numeric) · direction (credit/debit) · description · matched_id · matched_type · status (unmatched/matched/cleared) · created_at
- Constraint: `direction in ('credit','debit')`, `status in ('unmatched','matched','cleared')`.
- RLS: v1 permissive.

## vendor_payments
- id · user_id · vendor_id (fk vendors) · run_id (fk reconciliation_runs) · amount · payment_date · reference · status (outstanding/cleared) · cleared_at · created_at
- Constraint: `status in ('outstanding','cleared')`.
- RLS: v1 permissive.

## tenant_collections
- id · user_id · tenant_id (fk tenants) · run_id (fk reconciliation_runs) · amount · collection_date · source · note · matched (numeric) · status (pending/matched/short/excess) · created_at
- Constraint: `status in ('pending','matched','short','excess')`.
- RLS: v1 permissive.

## reconciliation_runs
- id · user_id · period_month (date) · total_credit · total_debit · variance · status (open/reconciled/locked) · closed_at · created_at
- Constraint: `status in ('open','reconciled','locked')`.
- RLS: v1 permissive.

## AI fields (later)
Auto-match will add: `match_confidence numeric`, `match_source text`, `review_status text default 'unreviewed'` to bank_transactions. Not in v1 schema.

## Relationships
- run -> many payments, many collections, many bank_transactions
- vendor -> many payments; tenant -> many collections
- bank_transaction.matched_id -> payment or collection id (soft ref, no FK)