# Security

## Secrets
- Supabase URL + anon key: public, in `NEXT_PUBLIC_*`. Service role key: server-only, never in frontend. Never commit `.env`.
- No secrets in client bundles.

## Permission model
- v1 demo: permissive RLS, reads/writes open so app renders without login.
- Lock-down sprint: replace with owner-scoped policies `auth.uid() = user_id` on every table. Backfill `user_id` on existing rows.
- Agent (later) inherits the acting user's permissions; never runs as service role for user actions.

## Approved-tools rule
- Agent may call only named tools (`suggest_match`, `apply_match`, `clear_payment`, `close_run`). Never raw SQL, never arbitrary HTTP.
- Lock_run is human-only; agent cannot call it.

## Audit principle
- Every state-changing action (capture, match, clear, close, lock) writes an audit row (later sprint).
- Before vs after stored as jsonb; who, when, tool, target.
- Truth is server-derived: status and totals come from the DB, not client state; survive refresh.

## Data-loss safety
- Delete and post-lock edits are human-only and flagged.
- If any lock-down or RLS work is beyond the builder, stop and get a human before exposing real data.